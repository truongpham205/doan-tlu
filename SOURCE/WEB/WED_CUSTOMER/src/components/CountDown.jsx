import React from 'react'
import Countdown from 'react-countdown'

const renderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    window.location.reload()
  } else {
    return (
      <span>
        {minutes}:{seconds}
      </span>
    )
  }
}

export const CountDownTime = (props) => {
  const { endTime } = props
  const timeCountdown = new Date(endTime).getTime() - new Date().getTime()
  return <>{timeCountdown > 0 && <Countdown date={Date.now() + timeCountdown} renderer={renderer} />}</>
}
