import * as React from 'react';
import { EmptyState, EmptyStateVariant } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  Table,
  RowFunctionArgs,
  TableProps,
  TableColumn,
} from '@console/internal/components/factory/table';
import { FilterToolbar, RowFilter } from '@console/internal/components/filter-toolbar';
import { getQueryArgument } from '@console/internal/components/utils/router';
import PaneBody from '@console/shared/src/components/layout/PaneBody';
import { LoadingBox } from '@console/shared/src/components/loading/LoadingBox';

interface CustomResourceListProps {
  queryArg?: string;
  rowFilters?: RowFilter[];
  sortBy: string;
  sortOrder: SortByDirection;
  ResourceRow: React.FC<RowFunctionArgs>;
  resources?: { [key: string]: any }[];
  resourceHeader: () => TableColumn[];
  EmptyMsg?: React.ComponentType;
  loaded?: boolean;
  rowFilterReducer?: (
    items: { [key: string]: any }[],
    filters: string | string[],
  ) => { [key: string]: any }[];
  textFilter?: string;
  textFilterReducer?: (
    items: { [key: string]: any }[],
    filters: string,
  ) => { [key: string]: any }[];
  customData?: any;
  getRowProps?: TableProps['getRowProps'];
}

const CustomResourceList: React.FC<CustomResourceListProps> = ({
  resources,
  loaded = true,
  EmptyMsg,
  queryArg,
  rowFilters,
  rowFilterReducer,
  textFilter,
  textFilterReducer,
  resourceHeader,
  ResourceRow,
  sortBy,
  sortOrder,
  customData,
  getRowProps,
}) => {
  const { t } = useTranslation();
  const applyFilters = React.useCallback(() => {
    const queryArgument = queryArg ? getQueryArgument(queryArg) : undefined;
    const activeFilters = queryArgument?.split(',');
    const params = new URLSearchParams(window.location.search);
    const filteredText = params.get(textFilter);

    let filteredItems = resources;
    if (activeFilters) {
      filteredItems = rowFilterReducer(filteredItems, activeFilters);
    }
    if (filteredText) {
      filteredItems = textFilterReducer(filteredItems, filteredText);
    }
    return filteredItems;
  }, [resources, queryArg, rowFilterReducer, textFilter, textFilterReducer]);

  const filteredListItems = applyFilters();

  if (!loaded) {
    return <LoadingBox />;
  }

  if (_.isEmpty(resources)) {
    return EmptyMsg ? (
      <EmptyMsg />
    ) : (
      <EmptyState variant={EmptyStateVariant.full}>
        <p>{t('console-shared~No resources found')}</p>
      </EmptyState>
    );
  }

  return (
    <PaneBody>
      {(rowFilters || textFilter) && (
        <FilterToolbar
          rowFilters={rowFilters}
          data={resources}
          textFilter={textFilter}
          hideLabelFilter
          reduxIDs={[]}
        />
      )}
      <Table
        data={filteredListItems}
        defaultSortField={sortBy}
        defaultSortOrder={sortOrder}
        aria-label="CustomResources"
        Header={resourceHeader}
        Row={ResourceRow}
        loaded={loaded}
        virtualize
        customData={customData}
        getRowProps={getRowProps}
      />
    </PaneBody>
  );
};

export default React.memo(CustomResourceList);
