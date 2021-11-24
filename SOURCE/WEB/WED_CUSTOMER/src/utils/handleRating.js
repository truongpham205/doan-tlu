import React from 'react';
import { isFloat } from '@utils/checkTypeNumber.js'

export const handleRating = (ratings) => {
  let ratingHTML = []
  let i = 1
  for (i; i <= ratings; i++) {
    ratingHTML.push(<i className="fas fa-star"></i>)
  }
  if (isFloat(ratings)) {
    ratingHTML.push(<i className="fas fa-star-half-alt"></i>)
  }
  return ratingHTML
}
