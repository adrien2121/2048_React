class Cell extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      let color = 'cell';
      let value;
      if (this.props.cellValue == 0) {
        value = "";
      } else {
        value = this.props.cellValue;
      }
  
      if (value) {
        color += ' color-' + value;
      }
  
      return (
        <td>
          <div className={color}>
            <div className="number">{value}</div>
          </div>
        </td>
        );
    }
  }