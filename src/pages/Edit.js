import { SaveOutlined } from '@ant-design/icons';
import { Button, message, Select } from 'antd';
import { ContentState, Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import React, { Component } from 'react';
import { fetch } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';


class Edit extends Component {

  theme = this.context.theme

  state = {
    loading: false,
    path: null,
    files: [],
    rawContent: '',
    content: '',
    editorState: EditorState.createEmpty()
  }

  componentDidMount() {
    this.fetchFileDir();
  }

  fetchFileDir = () => {
    this.setState({ loading: true })
    fetch('/api/auth/file/dir')
      .then(files => {
        this.setState({ files })
      })
      .finally(() => { this.setState({ loading: false }) })
  }

  handldEditContent = editorState => {
    this.setState({ editorState, content: editorState.getCurrentContent().getPlainText() })
  }

  handleChangeFile = (path) => {
    this.setState({ path }, () => {
      this.fetchFileContent(path);
    })
  }

  fetchFileContent = () => {
    this.setState({ loading: true })
    fetch(`/api/auth/file/content?path=${this.state.path}`)
      .then(rawContent => {
        this.setState({ rawContent, content: rawContent, editorState: EditorState.createWithContent(ContentState.createFromText(rawContent)) })
      })
      .finally(() => { this.setState({ loading: false }) })
  }

  saveFileContent = () => {
    const { path, content } = this.state
    this.setState({ loading: true })
    fetch(`/api/auth/file`, { method: 'POST', body: { path, content } })
      .then(() => {
        this.setState({ rawContent: content })
        message.success("保存成功")
      })
      .finally(() => { this.setState({ loading: false }) })
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    return (
      <div className="edit-page">
        <div>
          <Select showSearch placeholder="请选择源文件" style={{ width: '200px' }} onChange={this.handleChangeFile}>
            {
              this.state.files.map(file => <Select.Option key={file} value={file}>{file}</Select.Option>)
            }
          </Select>
          &nbsp;&nbsp;
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={this.state.rawContent === this.state.content || !this.state.path}
            loading={this.state.loading}
            onClick={this.saveFileContent}
          >保存</Button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Editor
            placeholder={this.state.path ? "该文件内容为空" : "未选择源文件"}
            editorState={this.state.editorState}
            onChange={this.handldEditContent}
          />
        </div>
      </div>
    );
  }
}

Edit.contextType = ThemeContext

export default Page(Edit);
