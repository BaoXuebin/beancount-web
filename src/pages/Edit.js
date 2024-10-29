import { SaveOutlined } from '@ant-design/icons';
import { Button, message, Select } from 'antd';
import React, { Component } from 'react';
import { fetch } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';
import BeancountEditor from '../components/BeancountEditor';


class Edit extends Component {

  theme = this.context.theme

  state = {
    loading: false,
    lang: 'beancount',
    path: null,
    files: [],
    rawContent: '',
    content: ''
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

  handldEditContent = content => {
    this.setState({ content })
  }

  handleChangeFile = (path) => {
    let lang = this.state.lang
    const s = path.split('.')
    lang = s[s.length - 1]
    this.setState({ path, lang }, () => {
      this.fetchFileContent(path);
    })
  }

  fetchFileContent = () => {
    this.setState({ loading: true })
    fetch(`/api/auth/file/content?path=${this.state.path}`)
      .then(rawContent => {
        this.setState({ rawContent, content: rawContent })
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
          <BeancountEditor lang={this.state.lang} value={this.state.content} onContentChange={this.handldEditContent} />
        </div>
      </div>
    );
  }
}

Edit.contextType = ThemeContext

export default Page(Edit);
