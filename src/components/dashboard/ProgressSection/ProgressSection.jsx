import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import './ProgressSection.scss'

class ProgressSection extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div styleName='root'>
        <div styleName='before' style={{ width: `${this.props.value}%` }} />
        <div styleName='current'>
          <div styleName='dot'>{this.props.value}%</div>
        </div>
        <div styleName='after' style={{ width: `${100 - this.props.value}%` }} />
      </div>
    )
  }
}

ProgressSection.propTypes = {
  value: PropTypes.number,
}

export default ProgressSection
