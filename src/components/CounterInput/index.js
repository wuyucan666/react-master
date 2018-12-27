import React, { PureComponent, Fragment } from 'react';
import { Input } from 'antd';

const wrapStyles = {
  position: 'relative',
};

const counterStyles = {
  position: 'absolute',
  right: '11px',
  top: '0',
};

class CounterInput extends PureComponent {
  state = {
    inputStyle: {},
  };

  componentDidMount() {
    const { style } = this.props;
    const width = this.counter.offsetWidth;
    const inputStyle = {
      ...style,
      paddingRight: `${width + 24}px`,
    };
    this.setState({
      inputStyle,
    });
  }

  render() {
    const { value = '', maxLength } = this.props;
    const { inputStyle } = this.state;
    return (
      <Fragment>
        {maxLength ? (
          <div style={wrapStyles}>
            <Input {...this.props} style={inputStyle} />
            <div
              style={counterStyles}
              ref={ref => {
                this.counter = ref;
              }}
            >
              {value.length}/{maxLength}
            </div>
          </div>
        ) : (
          <Input {...this.props} />
        )}
      </Fragment>
    );
  }
}
export default CounterInput;
