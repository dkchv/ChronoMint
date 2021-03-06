import React, { PureComponent } from 'react'
import { Translate } from 'react-redux-i18n'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { RaisedButton } from 'material-ui'
import { TextField, Checkbox } from 'redux-form-material-ui'
import validate from './validate'
import { Field, reduxForm } from 'redux-form/immutable'
import './AddPlatformForm.scss'
import { createPlatform } from 'redux/assetsManager/actions'

function prefix (token) {
  return `Assets.AddPlatformForm.${token}`
}

export const FORM_ADD_PLATFORM_DIALOG = 'AddPlatformDialog'

function mapStateToProps (state) {
  const form = state.get('form')
  return {
    formValues: form.get(FORM_ADD_PLATFORM_DIALOG) && form.get(FORM_ADD_PLATFORM_DIALOG).get('values'),
    formErrors: form.get(FORM_ADD_PLATFORM_DIALOG) && form.get(FORM_ADD_PLATFORM_DIALOG).get('syncErrors'),
  }
}

const onSubmit = (values, dispatch) => {
  dispatch(createPlatform(values))
}

@connect(mapStateToProps)
@reduxForm({ form: FORM_ADD_PLATFORM_DIALOG, validate, onSubmit })
export default class AddPlatformForm extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func,
    onClose: PropTypes.func,
    formValues: PropTypes.object,
    formErrors: PropTypes.object,
    onSubmitFunc: PropTypes.func,
    onSubmitSuccess: PropTypes.func,
  }

  render () {
    const alreadyHave = this.props.formValues && this.props.formValues.get('alreadyHave')

    return (
      <form styleName='content' onSubmit={this.props.handleSubmit}>
        <div styleName='dialogHeader'>
          <div styleName='dialogHeaderStuff'>
            <div styleName='dialogHeaderTitle'>
              <Translate value={prefix('dialogTitle')} />
            </div>
          </div>
        </div>
        <div styleName='dialogBody'>

          <Field
            styleName='checkboxField'
            component={Checkbox}
            name='alreadyHave'
            label={<Translate value={prefix('alreadyHave')} />}
          />

          {
            alreadyHave
              ? <Field
                component={TextField}
                name='platformAddress'
                fullWidth
                floatingLabelText={<Translate value={prefix('platformAddress')} />}
              />
              : null
          }

        </div>
        <div
          styleName='dialogFooter'
        >
          <RaisedButton
            disabled={!!this.props.formErrors}
            styleName='action'
            label={<Translate value={prefix('dialogTitle')} />}
            type='submit'
            primary
          />
        </div>
      </form>
    )
  }
}
