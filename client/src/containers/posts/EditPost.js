import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import withMutationState from 'apollo-mutation-state';

import PostForm from 'containers/posts/_PostForm';
import withFlashMessage from 'components/flash/withFlashMessage';

import POST_FOR_EDITING from 'graphql/posts/postForEditingQuery.graphql';
import UPDATE_POST from 'graphql/posts/updatePostMutation.graphql';

class EditPost extends Component {
  static propTypes = {
    data: PropTypes.object,
    updatePost: PropTypes.func,
    redirect: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.action = this.action.bind(this);
  }

  action(values) {
    return new Promise(async (resolve, reject) => {
      const { data: { updatePost: { errors } } } = await this.props.updatePost(values);
      if (!errors) {
        this.props.redirect('/', { notice: 'Post was successfully updated' });
      } else {
        reject(errors);
      }
    });
  }

  render() {
    const { data: { post } } = this.props;
    if (!post) {
      return null;
    }

    return (
      <div>
        <h1 className="title">Editing post</h1>
        <PostForm
          action={this.action}
          initialValues={{ ...post }}
          submitName="Update Post"
          mutation={this.props.mutation}
        />
      </div>
    );
  }
}

const withPostForEditing = graphql(POST_FOR_EDITING, {
  options: ownProps => ({
    variables: {
      id: ownProps.match.params.id
    },
    fetchPolicy: 'network-only'
  })
});

const withUpdatePost = graphql(UPDATE_POST, {
  props: ({ mutate, ownProps: { wrapMutate } }) => ({
    updatePost(post) {
      return wrapMutate(mutate({ variables: { ...post } }));
    }
  })
});

export default compose(
  withPostForEditing,
  withMutationState({ wrapper: true, propagateError: true }),
  withUpdatePost,
  withFlashMessage
)(EditPost);
