import React from 'react'

const TableData = ({ tableHeader }) => {
  return (
    <thead className="text-center bg-thead">
      <tr>
        {tableHeader?.map((item, index) => (
          <th key={index}>{item.header}</th>
        ))}
      </tr>
    </thead>
  )
}

export default TableData
