import { ROUTER } from '@constants/Constant'
import { Button, Tooltip } from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import FavoriteIcon from '@material-ui/icons/Favorite'
import { getImage } from '@utils/getImage.js'
import { handleRating } from '@utils/handleRating.js'
import React from 'react'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: '#f5f5f5',
  },
}))

export default function ReviewCard(props) {
  const classes = useStyles()
  const { tourDetail, displayHeart } = props
  let history = useHistory()

  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Avatar src={require('@assets/logo-tab.png')} aria-label="recipe" className={classes.avatar}>
            A
          </Avatar>
        }
        title={
          <Tooltip title={tourDetail?.name}>
            <div className="text-card">{tourDetail?.name}</div>
          </Tooltip>
        }
        subheader={<span className="star p-0">{handleRating(tourDetail?.rating || 5)}</span>}
      />
      <CardMedia className={classes.media} image={getImage(tourDetail.service_images)} title="Paella dish" />
      <CardContent>
        <div>
          <i className="icon-card fas fa-user mr-3 text-primary"></i>
          <span>{tourDetail?.people}</span>
        </div>
        <div>
          <i className="icon-card fas fa-home mr-3 text-yellow"></i>
          <span>{tourDetail?.service_category_name}</span>
        </div>
        <div>
          <i className="icon-card fas fa-phone mr-3 text-green"></i>
          <span>{`${tourDetail?.contact_name || 'Oho'} - ${tourDetail?.contact_phone}`}</span>
        </div>
        <div>
          <i className=" icon-card fas fa-map-marker-alt mr-3 text-red"></i>
          <span>{`${tourDetail?.district?.name} - ${tourDetail?.province?.name}`}</span>
        </div>
      </CardContent>
      <CardActions disableSpacing style={{ justifyContent: 'space-between' }}>
        {!displayHeart && (
          <IconButton aria-label="add to favorites">
            <FavoriteIcon style={{ color: 'red' }} />
          </IconButton>
        )}
        <Button
          size="small"
          style={{ backgroundColor: '#0abe35', color: '#fff' }}
          variant="contained"
          onClick={() => history.push(ROUTER.TOUR_DETAIL_PAGE + `/${tourDetail.id}`)}
        >
          Đặt phòng ngay
        </Button>
      </CardActions>
    </Card>
  )
}
