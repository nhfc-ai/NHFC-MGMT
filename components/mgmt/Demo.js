import React from 'react';
import { Column, Table } from 'react-virtualized';
import Draggable from 'react-draggable';

const TOTAL_WIDTH = 500;

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widths: {},
    };
  }

  componentDidMount() {
    const { array } = this.props;
    const columnWidth = 1 / Object.keys(array[0]).length;
    const columnList = Object.keys(array[0]);
    const widthObject = {};
    columnList.forEach((column) => {
      widthObject[column] = columnWidth;
    });
    console.log(widthObject);
    this.setState({ widths: widthObject });
  }

  render() {
    const { array } = this.props;
    const { widths } = this.state;
    const body = [];
    {
      // const columnList = Object.keys(array[0]);
      const columnList = [];
      for (let i = 0; i < columnList.length; i += 1) {
        body.push(
          <Column
            headerRenderer={this.headerRenderer}
            dataKey={columnList[i].toLowerCase()}
            label={columnList[i]}
            width={widths.name * TOTAL_WIDTH}
          />,
        );
      }
    }
    return (
      <Table
        width={TOTAL_WIDTH}
        height={300}
        headerHeight={20}
        rowHeight={30}
        rowCount={array.length}
        rowGetter={({ index }) => array[index]}
      >
        {body}
      </Table>
    );
  }

  headerRenderer = ({ columnData, dataKey, disableSort, label, sortBy, sortDirection }) => {
    return (
      <React.Fragment key={dataKey}>
        <div className="ReactVirtualized__Table__headerTruncatedText">{label}</div>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          onDrag={(event, { deltaX }) =>
            this.resizeRow({
              dataKey,
              deltaX,
            })
          }
          position={{ x: 0 }}
          zIndex={999}
        >
          <span className="DragHandleIcon">⋮</span>
        </Draggable>
      </React.Fragment>
    );
  };

  resizeRow = ({ dataKey, deltaX }) =>
    this.setState((prevState) => {
      const prevWidths = prevState.widths;
      const percentDelta = deltaX / TOTAL_WIDTH;

      // This is me being lazy :)
      const nextDataKey = dataKey === 'name' ? 'location' : 'description';

      return {
        widths: {
          ...prevWidths,
          [dataKey]: prevWidths[dataKey] + percentDelta,
          [nextDataKey]: prevWidths[nextDataKey] - percentDelta,
        },
      };
    });
}
