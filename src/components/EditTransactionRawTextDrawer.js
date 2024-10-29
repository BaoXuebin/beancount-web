import { Button, Drawer, Form, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import BeancountEditor from './BeancountEditor'
import './styles/EditTransactionRawTextDrawer.css'
import { fetch } from '../config/Util'


const EditTransactionRawTextDrawer = (props) => {

  const formRef = useRef(null);

  const [loading, setLoading] = useState(false)
  const [transactionId, setTransactionId] = useState(null)

  useEffect(() => {
    if (props.visible && props.transaction && props.transaction.id !== transactionId) {
      setTransactionId(props.transaction.id)
      setLoading(true)
      fetch('/api/auth/transaction/raw?id=' + props.transaction.id)
        .then((rawText) => {
          formRef.current.setFieldsValue({ rawText })
        }).catch(console.error).finally(() => { setLoading(false) })
    }
  }, [props.visible])

  useEffect(() => {
    if (props.transaction.id && props.transaction.id !== transactionId) {
      if (formRef && formRef.current) {
        formRef.current.resetFields();
      }
    }
  }, [props.transaction.id])

  const handleUpdateTransactionRawText = (formValue) => {
    setLoading(true)
    fetch('/api/auth/transaction/raw', { method: 'POST', body: { id: props.transaction.id, rawText: formValue.rawText } })
      .then(() => {
        if (props.onClose && typeof props.onClose === 'function') {
          props.onClose();
        }
        if (props.onSubmit && typeof props.onSubmit === 'function') {
          props.onSubmit();
        }
      }).catch(console.error).finally(() => { setLoading(false) })
  }

  return (
    <Drawer
      className="edit-transaction-raw-text-drawer page-drawer"
      title={<div style={{ fontSize: 14 }}>编辑源文件</div>}
      height="70vh"
      placement="bottom"
      bodyStyle={{ display: 'flex', justifyContent: 'center' }}
      closable={true}
      {
      ...props
      }
    >
      <Form
        name="sync-price-form"
        className="page-form"
        size="large"
        style={{ textAlign: 'left' }}
        ref={formRef}
        onFinish={handleUpdateTransactionRawText}
      >
        <Spin spinning={loading}>
          <Form.Item name="rawText">
            <BeancountEditor
              lang="beancount"
              theme="vs-light"
              height="400px"
            />
          </Form.Item>
        </Spin>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
            保存
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default EditTransactionRawTextDrawer