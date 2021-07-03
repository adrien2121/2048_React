class Row extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
        <tr>
          {(this.props.row).map((cell, i) => (<Cell cellValue={cell} key={i} />))}
        </tr>
        );
    }
  }