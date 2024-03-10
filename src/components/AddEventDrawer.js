import React, { useState } from 'react'
import { Button, Drawer, Form, Input, Select } from 'antd'

import { fetch } from '../config/Util';
import dayjs from 'dayjs';
const validateMessages = {
  required: '${label} 不能为空！'
};


const AddEventDrawer = (props) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false)

  const addEventReq = () => {
    const values = form.getFieldsValue()
    setLoading(true)
    fetch(`/api/auth/event`, {
      method: 'POST',
      body: values
    })
      .then(res => {
        form.resetFields()
        props.onClose(res)
      }).catch(console.error)
      .finally(() => { setLoading(false) })
  }

  return (
    <div className="add-event-drawer component">
      <Drawer
        title="新增事件"
        placement="bottom"
        closable={true}
        height="60vh"
        className="page-drawer"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        forceRender
        {
        ...props
        }
      >
        <div className="page-form">
          <Form
            name="add-event-form"
            className="page-form"
            size="large"
            style={{ textAlign: 'left' }}
            form={form}
            onFinish={addEventReq}
            validateMessages={validateMessages}
          >
            <Form.Item name="date" initialValue={dayjs().format('YYYY-MM-DD')} rules={[{ required: true }]}>
              <Input type="date" placeholder="时间" />
            </Form.Item>
            <Form.Item
              name="types"
              rules={[{ required: true }]}
            >
              {/* <Input placeholder="事件名称" /> */}
              <Select
                mode="tags"
                allowClear
                placeholder="事件名称"
                options={(props.types || []).map(type => ({ label: type, value: type }))}
              />
            </Form.Item>
            <Form.Item
              name="description"
              rules={[{ required: true }]}
            >
              <Input placeholder="事件内容" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  )
}

export default AddEventDrawer