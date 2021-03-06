import React, { Component } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { connect } from 'react-redux'

import PollModel from 'models/PollModel'
import { modalsOpen } from 'redux/modals/actions'
import { listPolls } from 'redux/voting/actions'
import { getStatistics } from 'redux/voting/getters'
import { initTIMEDeposit } from 'redux/wallet/actions'

import { RaisedButton, Paper, CircularProgress } from 'material-ui'
import { Poll, PollDialog } from 'components'
import styles from 'layouts/partials/styles'

import './VotingContent.scss'
import { Link } from 'react-router'

@connect(mapStateToProps, mapDispatchToProps)
export default class VotingContent extends Component {

  static propTypes = {
    isCBE: PropTypes.bool,
    isFetched: PropTypes.bool,
    isFetching: PropTypes.bool,
    list: PropTypes.object,
    timeDeposit: PropTypes.object,
    statistics: PropTypes.object,
    initTIMEDeposit: PropTypes.func,
    getList: PropTypes.func,
    handleNewPoll: PropTypes.func
  }

  componentWillMount () {
    this.props.initTIMEDeposit()

    if (!this.props.isFetched && !this.props.isFetching) {
      this.props.getList()
    }
  }

  render () {
    if (!this.props.isFetched) {
      return (
        <div styleName='progress'>
          <CircularProgress size={24} thickness={1.5} />
        </div>
      )
    }

    if (this.props.timeDeposit.equals(new BigNumber(0))) {
      return (
        <div styleName='root'>
          <div styleName='content'>
            <div styleName='accessDenied'>
              <i className='material-icons' styleName='accessDeniedIcon'>warning</i>Deposit TIME on <Link to='/wallet'>Wallet page</Link> if you want get access this page.
            </div>
          </div>
        </div>
      )
    }

    const polls = this.props.isFetched
      ? this.props.list.valueSeq().toArray()
      : []

    return (
      <div styleName='root'>
        <div styleName='content'>
          {this.renderHead(polls)}
          {this.renderBody(polls)}
        </div>
      </div>
    )
  }

  renderHead () {

    const {statistics} = this.props

    return (
      <div styleName='head'>
        <h3>Voting</h3>
        <div styleName='inner'>
          <div className='VotingContent__head'>
            <div className='row'>
              <div className='col-sm-1'>
                <div styleName='stats'>
                  <div styleName='stats-item stats-all'>
                    <div styleName='icon'>
                      <i className='material-icons'>poll</i>
                    </div>
                    <div styleName='entry'>
                      <span styleName='entry1'>All polls:</span><br />
                      <span styleName='entry2'>{statistics.all}</span>
                    </div>
                  </div>
                  <div styleName='stats-item stats-completed'>
                    <div styleName='icon'>
                      <i className='material-icons'>check</i>
                    </div>
                    <div styleName='entry'>
                      <span styleName='entry1'>Completed polls:</span><br />
                      <span styleName='entry2'>{statistics.completed}</span>
                    </div>
                  </div>
                  <div styleName='stats-item stats-outdated'>
                    <div styleName='icon'>
                      <i className='material-icons'>event_busy</i>
                    </div>
                    <div styleName='entry'>
                      <span styleName='entry1'>Outdated polls:</span><br />
                      <span styleName='entry2'>{statistics.outdated}</span>
                    </div>
                  </div>
                  <div styleName='stats-item stats-inactive'>
                    <div styleName='icon'>
                      <i className='material-icons'>error_outline</i>
                    </div>
                    <div styleName='entry'>
                      <span styleName='entry1'>Inactive polls:</span><br />
                      <span styleName='entry2'>{statistics.inactive}</span>
                    </div>
                  </div>
                  <div styleName='stats-item stats-ongoing'>
                    <div styleName='icon'>
                      <i className='material-icons'>access_time</i>
                    </div>
                    <div styleName='entry'>
                      <span styleName='entry1'>Polls ongoing:</span><br />
                      <span styleName='entry2'>{statistics.ongoing}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-sm-1'>
                <div styleName='alignRight'>
                  <div styleName='entries'>
                  </div>
                  <div styleName='actions'>
                    <RaisedButton
                      label='New Poll'
                      styleName='action'
                      onTouchTap={() => this.props.handleNewPoll()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderBody (polls) {

    return (
      <div styleName='body'>
        <div styleName='inner'>
          <div className='VotingContent__body'>
            <div className='row'>
              {polls.map((poll) => (
                <div className='col-sm-6 col-md-3' key={poll.poll().id()}>
                  <Paper style={styles.content.paper.style}>
                    <Poll model={poll} />
                  </Paper>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  const session = state.get('session')
  const voting = state.get('voting')
  const wallet = state.get('wallet')
  return {
    list: voting.list,
    timeDeposit: wallet.timeDeposit,
    statistics: getStatistics(voting),
    isCBE: session.isCBE,
    isFetched: voting.isFetched && wallet.tokensFetched,
    isFetching: voting.isFetching && !voting.isFetched
  }
}

function mapDispatchToProps (dispatch) {
  return {
    getList: () => dispatch(listPolls()),
    initTIMEDeposit: () => dispatch(initTIMEDeposit()),
    handleNewPoll: () => dispatch(modalsOpen({
      component: PollDialog,
      props: {
        isModify: false,
        initialValues: new PollModel()
      }
    }))
  }
}
