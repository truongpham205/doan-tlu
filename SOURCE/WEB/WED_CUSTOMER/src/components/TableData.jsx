import React from 'react'

const TableData = ({ tableData, getDetail, update, isOpen }) => {
  console.log(tableData)
  return (
    <table id="example2" className="table table-bordered table-striped table-responsive-sm table-responsive-md">
      <thead className="text-center bg-thead">
        <tr>
          {tableData.map((item) => (
            <th>{item.header}</th>
          ))}
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {tableData.map((item) => (
            <td>{item.body}</td>
          ))}
          <td className="width2btn">
            <i className="btnInfo fa fa-info-circle" onClick={getDetail} />
            <i className="btnEdit fa fa-fw fa-edit" onClick={update} />
            <i className="btnDelete far fa-trash-alt" onClick={isOpen} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default TableData
