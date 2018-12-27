import React, { PureComponent } from 'react'
import ImageWrapper from '../components/ImageWrapper'
import logo from '../../assets/logo.svg'

export default class Home extends PureComponent {
  render () {
    return (
      <ImageWrapper src={logo} />
    )
  }
}
