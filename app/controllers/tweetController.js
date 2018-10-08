var Tweet = require('../models/tweet');
var User = require('../models/user');
var elasticsearch = require('elasticsearch');
var config = require('../config');

var client = new elasticsearch.Client({
    host: config.eshost
});

function esSearch(res, body) {
    client
        .search({
            index: 'twitter',
            type: 'tweets',
            body: body
        })
        .then(
            function(resp) {
                return res.json({ items: resp.hits.hits, status: 'OK' });
            },
            function(err) {
                return res.status(500).json({ status: 'error' });
            }
        );
}

exports.addItem = function(req, res, next) {
    if (req.body.content === undefined) {
        return res.status(500).json({ status: 'error' });
    }
    User.findOne({ username: req.username }, function(err, user) {
        newTweet = new Tweet({
            username: req.username,
            content: req.body.content,
            timestamp: Math.floor(new Date() / 1000)
        });
        if (user && user.profile !== undefined) {
            newTweet.profile = user.profile;
        }
        if (req.body.childType !== undefined) {
            Tweet.findOne({ id: req.body.parent }, function(err, tweet) {
                if (req.body.childType === 'retweet') {
                    tweet.retweeted++;
                } else if (req.body.childType === 'reply') {
                    tweet.replies++;
                }
                tweet.save();
            });
            newTweet.childType = req.body.childType;
            newTweet.parent = req.body.parent;
        }
        if (req.body.media !== undefined) {
            for (let id of req.body.media) {
                newTweet.media.push(id);
            }
        }
        newTweet.save().then(function(tweet) {
            res.json({ status: 'OK', item: tweet });
        });
    });
};

exports.getItem = function(req, res, next) {
    Tweet.findOne({ id: req.params.id }, function(err, tweet) {
        if (!tweet) {
            return res.status(500).json({ status: 'error' });
        }
        res.json({ status: 'OK', item: tweet });
    });
};

exports.deleteItem = function(req, res, next) {
    Tweet.findOne({ id: req.params.id }, function(err, tweet) {
        if (!tweet) {
            return res.status(500).json({ status: 'error' });
        }
        if (tweet.parent) {
            Tweet.findOne({ id: tweet.parent }, function(err, parent) {
                if (parent) {
                    if (tweet.childType === 'retweet') {
                        parent.retweeted--;
                    } else if (tweet.childType === 'reply') {
                        parent.replies--;
                    }
                    parent.save();
                }
            });
        }
        Tweet.deleteMany(
            { parent: req.params.id, childType: 'reply' },
            function(err) {}
        );
        tweet.remove();
        res.json({ status: 'OK' });
    });
};

exports.likeItem = function(req, res, next) {
    Tweet.findOne({ id: req.params.id }, function(err, tweet) {
        if (!tweet) {
            return res.status(500).json({ status: 'error' });
        }
        if (req.body.like === undefined) {
            req.body.like = true;
        }
        let index = tweet.property.likes.indexOf(req.username);
        if (index === -1 && req.body.like) {
            tweet.property.likes.push(req.username);
        } else if (index !== -1 && !req.body.like) {
            tweet.property.likes.splice(index, 1);
        }
        tweet.save();
        res.json({ status: 'OK', item: tweet });
    });
};

exports.getFeed = function(req, res, next) {
    var body;
    if (req.params.type === 'feed') {
        if (req.params.username !== undefined) {
            User.findOne({ username: req.params.username }, function(
                err,
                user
            ) {
                if (!user) {
                    return res.status(500).json({ status: 'error' });
                }
                let should = [];
                for (let name of user.following) {
                    should.push({ match: { username: name } });
                }

                esSearch(res, {
                    sort: [{ timestamp: { order: 'desc' } }],
                    query: {
                        bool: {
                            must_not: {
                                match: {
                                    childType: 'reply'
                                }
                            },
                            should: should,
                            minimum_should_match: '50%'
                        }
                    }
                });
            });
        } else {
            body = {
                sort: [{ timestamp: { order: 'desc' } }],
                query: {
                    bool: {
                        must_not: {
                            match: {
                                childType: 'reply'
                            }
                        }
                    }
                }
            };
        }
    } else if (req.params.type === 'trending') {
        body = {
            sort: [
                { retweeted: 'desc' },
                { replies: 'desc' },
                { timestamp: 'desc' }
            ],
            query: {
                bool: {
                    must_not: {
                        match: {
                            childType: 'reply'
                        }
                    }
                }
            }
        };
    } else if (req.params.type === 'user' && req.params.username) {
        body = {
            sort: [{ timestamp: { order: 'desc' } }],
            query: {
                bool: {
                    must: { match: { username: req.params.username } },
                    must_not: {
                        match: {
                            childType: 'reply'
                        }
                    }
                }
            }
        };
    } else {
        return res.status(500).json({ status: 'error' });
    }
    if (req.params.type !== 'feed' || req.params.username === undefined) {
        esSearch(res, body);
    }
};

exports.getReplies = function(req, res, next) {
    esSearch(res, {
        sort: [{ timestamp: { order: 'desc' } }],
        query: {
            bool: {
                must: [
                    { term: { parent: req.params.id } },
                    { match: { childType: 'reply' } }
                ]
            }
        }
    });
};

exports.search = function(req, res, next) {
    if (req.body.replies === undefined) {
        req.body.replies = false;
    }
    var query;
    if (req.body.replies && req.body.parent) {
        query = {
            bool: {
                must: [
                    {
                        multi_match: {
                            query: req.body.q,
                            fields: ['username', 'content']
                        }
                    },
                    {
                        match: { childType: 'reply' }
                    },
                    {
                        term: { parent: req.body.parent }
                    }
                ]
            }
        };
    } else {
        if (req.body.username === undefined) {
            query = {
                bool: {
                    must: {
                        multi_match: {
                            query: req.body.q,
                            fields: ['username', 'content']
                        }
                    },
                    must_not: {
                        match: {
                            childType: 'reply'
                        }
                    }
                }
            };
        } else {
            query = {
                bool: {
                    must: [
                        { match: { content: req.body.q } },
                        { match: { username: req.body.username } }
                    ],
                    must_not: {
                        match: {
                            childType: 'reply'
                        }
                    }
                }
            };
        }
    }
    esSearch(res, {
        sort: [{ timestamp: { order: 'desc' } }],
        query: query
    });
};
