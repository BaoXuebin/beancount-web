import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import React from 'react';

class FileEditor extends React.Component {

  state = { editorState: EditorState.createEmpty() };

  onChange = editorState => this.setState({ editorState });

  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

export default FileEditor