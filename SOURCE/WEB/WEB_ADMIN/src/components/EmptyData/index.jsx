import { Empty } from 'antd'
import { STRING } from 'constants/Constant'
import React from 'react'
EmptyData.propTypes = {}

function EmptyData(props) {
  return (
    <tr className="text-center">
      <td className="p-2" colSpan={12}>
        <Empty description={<span>{STRING.emptyData}</span>} />
      </td>
    </tr>
  )
}

export default EmptyData
