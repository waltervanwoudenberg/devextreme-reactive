import * as React from 'react';
import { memoize, MemoizedComputed } from '@devexpress/dx-core';
import {
  Plugin, Getter, Action, createStateHelper, StateHelper, ActionFn, Getters,
} from '@devexpress/dx-react-core';
import {
  tableColumnsWithWidths,
  tableColumnsWithDraftWidths,
  changeTableColumnWidth,
  draftTableColumnWidth,
  cancelTableColumnWidthDraft,
  ColumnWidthPayload,
  TableColumnWidthInfo,
} from '@devexpress/dx-grid-core';
import { TableColumnResizingProps, TableColumnResizingState } from '../types';

const pluginDependencies = [
  { name: 'Table' },
];

// tslint:disable-next-line: max-line-length
class TableColumnResizingBase extends React.PureComponent<TableColumnResizingProps, TableColumnResizingState> {
  static defaultProps = {
    defaultColumnWidths: [],
  };
  changeTableColumnWidth: ActionFn<ColumnWidthPayload>;
  draftTableColumnWidth: ActionFn<ColumnWidthPayload>;
  cancelTableColumnWidthDraft: ActionFn<any>;
  tableColumnsComputed: MemoizedComputed<TableColumnWidthInfo[], typeof tableColumnsWithWidths>;
  // tslint:disable-next-line: max-line-length
  tableColumnsDraftComputed: MemoizedComputed<TableColumnWidthInfo[], typeof tableColumnsWithDraftWidths>;

  constructor(props) {
    super(props);

    this.state = {
      columnWidths: props.columnWidths || props.defaultColumnWidths,
      draftColumnWidths: [],
    };

    const stateHelper: StateHelper = createStateHelper(
      this,
      {
        columnWidths: () => {
          const { onColumnWidthsChange } = this.props;
          return onColumnWidthsChange;
        },
      },
    );

    this.tableColumnsComputed = memoize(
      columnWidths => (
        { tableColumns }: Getters,
      ) => tableColumnsWithWidths(tableColumns, columnWidths),
    );
    this.tableColumnsDraftComputed = memoize(
      draftColumnWidths => (
        { tableColumns }: Getters,
      ) => tableColumnsWithDraftWidths(tableColumns, draftColumnWidths),
    );

    this.changeTableColumnWidth = stateHelper.applyReducer.bind(
      stateHelper, (prevState, payload) => {
        const { minColumnWidth, maxColumnWidth, columnExtensions } = this.props;
        return changeTableColumnWidth(
          prevState,
          { ...payload, minColumnWidth, maxColumnWidth, columnExtensions },
        );
      },
    );
    this.draftTableColumnWidth = stateHelper.applyReducer.bind(
      stateHelper, (prevState, payload) => {
        const { minColumnWidth, maxColumnWidth, columnExtensions } = this.props;
        return draftTableColumnWidth(
          prevState,
          { ...payload, minColumnWidth, maxColumnWidth, columnExtensions },
        );
      },
    );
    this.cancelTableColumnWidthDraft = stateHelper.applyReducer.bind(
      stateHelper, cancelTableColumnWidthDraft,
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      columnWidths = prevState.columnWidths,
    } = nextProps;

    return {
      columnWidths,
    };
  }

  render() {
    const { columnWidths, draftColumnWidths } = this.state;

    const tableColumnsComputed = this.tableColumnsComputed(columnWidths);
    const tableColumnsDraftComputed = this.tableColumnsDraftComputed(draftColumnWidths);

    return (
      <Plugin
        name="TableColumnResizing"
        dependencies={pluginDependencies}
      >
        <Getter name="tableColumnResizingEnabled" value />
        <Getter name="tableColumns" computed={tableColumnsComputed} />
        <Getter name="tableColumns" computed={tableColumnsDraftComputed} />
        <Action name="changeTableColumnWidth" action={this.changeTableColumnWidth} />
        <Action name="draftTableColumnWidth" action={this.draftTableColumnWidth} />
        <Action name="cancelTableColumnWidthDraft" action={this.cancelTableColumnWidthDraft} />
      </Plugin>
    );
  }
}

/* tslint:disable: max-line-length */
/** A plugin that manages table column widths. */
export const TableColumnResizing: React.ComponentType<TableColumnResizingProps> = TableColumnResizingBase;
/* tslint:enable: max-line-length */
