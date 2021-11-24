import React from 'react'

const AccountIcon = ({ iconType, ...rest }) => <img {...rest} src={`../../web/icons/${iconType}.png`} alt="" width={32} height={32} />

export default AccountIcon