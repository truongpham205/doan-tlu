import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import { makeStyles } from '@material-ui/core/styles'
import React from 'react'

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    marginBottom: 1,
    maxHeight: 250,
    margin: '0px 1px',
    width: '100%',
  },
})

export default function ImgMediaCard(props) {
  const { image, name, handle } = props
  const classes = useStyles()

  return (
    <Card className={classes.root} onClick={handle}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          image={image}
          title="Contemplative Reptile"
        />
        <CardContent>
          <div className="text-card">{name}</div>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
