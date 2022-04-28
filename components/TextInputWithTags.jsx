const { getModuleByDisplayName, React } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');
const { FormItem } = require('powercord/components/settings')

const InputWithTags = AsyncComponent.from(getModuleByDisplayName('TextInputWithTags'))

module.exports = class TextInputWithTags extends React.PureComponent {
  render () {
    const { title, note, required } = this.props;
    delete this.props.children;

    return (
      <FormItem title={title} note={note} required={required} noteHasMargin>
          <InputWithTags {...this.props} />
      </FormItem>
    );
  }
};
