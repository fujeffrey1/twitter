import React from 'react';
import ModalImage from 'react-modal-image';
import { ROOT_URL } from '../../actions/types';

const PostsMedia = props => {
  const renderImages = props.media.map(id => {
    let url = `${ROOT_URL}/media/${id}`;
    return (
      <div className="slide" key={id}>
        <ModalImage small={url} medium={url} alt="" />
      </div>
    );
  });

  return <div className="carousel">{renderImages}</div>;
};

export default PostsMedia;
