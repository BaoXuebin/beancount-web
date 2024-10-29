import React, { useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';

const BeancountEditor = (props) => {

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // 监听内容变化事件
    editor.onDidChangeModelContent(() => {
      // 注册自定义语言
      monaco.languages.register({ id: 'beancount' });

      // 定义语言的 Tokenizer 规则
      monaco.languages.setMonarchTokensProvider('beancount', {
        tokenizer: {
          root: [
            // 交易标记: *、! 等
            [/\*|\!/, 'keyword'],

            // 日期: YYYY-MM-DD
            [/\d{4}-\d{2}-\d{2}/, 'number'],

            // 账户名称: Assets:XXX、Expenses:XXX
            [/\b(Assets|Liabilities|Equity|Income|Expenses)(:[\w\-]+)+\b/, 'type.identifier'],

            // 金额: 数字 (包含小数和负数)
            [/-?\d+(\.\d+)?\s*(USD|CNY|EUR)?/, 'number'],

            // 注释
            [/;.*/, 'comment'],

            // 其他关键字
            [/^\s*(include|option|plugin)\b/, 'keyword'],

            // 字符串 (使用引号括起来)
            [/\".*\"/, 'string'],
          ],
        },
      });

      // 设置默认配置
      monaco.languages.setLanguageConfiguration('beancount', {
        comments: {
          lineComment: ';',
        },
        brackets: [['{', '}'], ['[', ']'], ['(', ')']],
        autoClosingPairs: [
          { open: '"', close: '"' },
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
        ],
      });

      const content = editor.getValue();
      if (props.onContentChange && typeof props.onContentChange === 'function') {
        props.onContentChange(content);
      }
    });
  };

  const getLang = () => {
    if (props.lang === 'bean') {
      return 'beancount';
    } else {
      return props.lang;
    }
  }

  return (
    <Editor
      height={props.height || "75vh"}
      defaultLanguage={getLang()} // 设置默认语言
      theme="light" // 设置主题，选择合适的主题
      onMount={handleEditorDidMount}
      options={{
        selectOnLineNumbers: true, // 行号选择
        automaticLayout: true, // 自动布局
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontFamily: "'Consolas', monospace", // 更换字体
        fontSize: 14, // 更换字号
        lineHeight: 20, // 调整行高
        fontWeight: '500', // 设置字体粗细
      }}
      {
      ...props
      }
    />
  );
};

export default BeancountEditor;
