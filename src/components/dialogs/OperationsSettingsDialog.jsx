import { Field, reduxForm, formPropTypes } from 'redux-form/immutable'
import { FlatButton, RaisedButton } from 'material-ui'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { TextField } from 'redux-form-material-ui'
import { Translate } from 'react-redux-i18n'
import { connect } from 'react-redux'
import { modalsClose } from 'redux/modals/actions'
import { setRequiredSignatures } from 'redux/operations/actions'
import ErrorList from 'components/forms/ErrorList'
import ModalDialog from 'components/dialogs/ModalDialog'
import validator from 'components/forms/validator'

import './FormDialog.scss'

export const FORM_OPERATION_SETTINGS = 'OperationSettingsDialog'

function prefix (token) {
  return `components.dialogs.OperationsSettingsDialog.${token}`
}

@connect(mapStateToProps, mapDispatchToProps)
@reduxForm({
  form: FORM_OPERATION_SETTINGS,
  validate: (values) => { // TODO async validate
    const errors = {}
    errors.requiredSigns = ErrorList.toTranslate(validator.positiveInt(values.get('requiredSigns')))
    if (!errors.requiredSigns && parseInt(values.get('requiredSigns'), 10) > parseInt(values.get('adminCount'), 10)) {
      errors.requiredSigns = ErrorList.toTranslate('operations.errors.requiredSigns')
    }
    return errors
  },
})
export default class OperationsSettingsDialog extends PureComponent {
  static propTypes = {
    adminCount: PropTypes.number,
    handleAddressChange: PropTypes.func,
    name: PropTypes.string,
    onClose: PropTypes.func,
  } & formPropTypes

  render () {
    return (
      <ModalDialog
        onClose={() => this.props.onClose()}
      >
        <form styleName='root' onSubmit={this.props.handleSubmit}>
          <div styleName='header'>
            <h3 styleName='title'><Translate value={prefix('operationsSettings')} /></h3>
          </div>
          <div styleName='content'>
            <div>
              <p>{<Translate value='operations.adminCount' />}: <b>{this.props.adminCount}</b></p>
            </div>
            <Field
              component={TextField}
              name='requiredSigns'
              fullWidth
              floatingLabelText={<Translate value='operations.requiredSigns' />}
            />
          </div>
          <div styleName='footer'>
            <FlatButton styleName='action' label={<Translate value={prefix('cancel')} />} onTouchTap={() => this.props.onClose()} />
            <RaisedButton styleName='action' label={<Translate value={prefix('save')} />} primary type='submit' />
          </div>
        </form>
      </ModalDialog>
    )
  }
}

function mapStateToProps (state) {
  const operations = state.get('operations')
  return {
    adminCount: operations.adminCount,
    initialValues: {
      requiredSigns: operations.required,
      adminCount: operations.adminCount,
    },
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onClose: () => dispatch(modalsClose()),
    onSubmit: (values) => {
      dispatch(modalsClose())
      dispatch(setRequiredSignatures(parseInt(values.get('requiredSigns'), 10)))
    },
  }
}

