import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'

const useStyles = makeStyles({
  root: {
    // maxWidth: 345,
    marginBottom: 1,
    margin: '0px 1px',
    width: '100%',
    maxHeight: 300,
    height: '100%',
    backgroundColor: 'rgba(149, 157, 165, 0.2)',
    cursor: 'pointer', 
  },
})

export default function CardAttractive(props) {
  const { name, image, handle, description } = props
  const classes = useStyles()

  return (
    <div className="card-attractive_root" onClick={handle}>
      <div>
        <img src={image} style={{ height: 300 }} />
      </div>
      <div className="card-attractive_description">
        <p style={{ fontWeight: 500, marginBottom: '5px' }}>{name || ''}</p>
        <Tooltip title={description}>
          <div className="card-attractive_text" style={{ fontSize: '14px' }}>
            {description || ''}
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
