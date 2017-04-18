import React from 'react'
import PropTypes from 'prop-types'
import globalStyles from '../styles'

const PageBase = (props) => {
  const {title} = props

  return (
    <div style={globalStyles.pageBase}>
      <h3 style={globalStyles.title2}>{title}</h3>
      {props.children}
      <div style={globalStyles.clear} />
    </div>
  )
}

PageBase.propTypes = {
  title: PropTypes.object,
  children: PropTypes.array
}

export default PageBase
