import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Tooltip } from '@material-ui/core'

const useStyles = makeStyles({
  root: {
    // maxWidth: 345,
    marginBottom: 1,
    margin: '0px 1px',
    width: '100%',
  },
})

export default function CardLocation(props) {
  const { name, image, handle, description, isReview } = props
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      {/* <Tooltip title={description}> */}
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          height="140"
          image={image}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h6" className="text-card">
            {name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" className="content-card">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      {/* </Tooltip> */}
      <CardActions style={{ justifyContent: 'flex-end' }}>
        {!isReview ? (
          <>
            <Tooltip title={description}>
              <Button size="small" color="primary">
                Chi tiết
              </Button>
            </Tooltip>
            <Button
              size="small"
              style={{ backgroundColor: '#0abe35', color: '#fff' }}
              variant="contained"
              onClick={handle}
            >
              Đặt phòng ngay
            </Button>
          </>
        ) : (
          <Button size="small" color="primary" onClick={handle}>
            Chi tiết bài viết
          </Button>
        )}
      </CardActions>
    </Card>
  )
}
