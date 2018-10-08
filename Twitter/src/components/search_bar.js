import React, { Component } from 'react';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = { term: '', display: '' };

    this.onInputChange = this.onInputChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onFormClear = this.onFormClear.bind(this);
  }

  onInputChange(event) {
    this.setState({ term: event.target.value });
  }

  onFormSubmit(event) {
    event.preventDefault();
    if (this.state.term !== '') {
      this.props.onSearch(this.state.term);
      this.setState({ term: '', display: this.state.term });
    }
  }

  onFormClear() {
    this.props.onClear();
    this.setState({ display: '' });
  }

  render() {
    return (
      <div className="search-bar">
        <form onSubmit={this.onFormSubmit} className="input-group">
          <div className="input-group-prepend pr-2">
            <span className="icon" />
          </div>
          <input
            placeholder="Search..."
            className="form-control"
            value={this.state.term}
            onChange={this.onInputChange}
          />
          <div className="input-group-append">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {this.state.display !== '' ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={this.onFormClear}
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
        {this.state.display ? (
          <strong style={{ display: 'block', marginTop: 20 }}>
            Search Results for:
            <span style={{ color: '#e8491d' }}> {this.state.display}</span>
          </strong>
        ) : null}
      </div>
    );
  }
}

export default SearchBar;
