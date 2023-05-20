import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { api } from "../../api/api";
import { ApiEndpoints } from "../../api/constants";
import {
  CategoryListResponse,
  PagedRequest,
  PagedResponse,
} from "../../models/response";
import { Dapp } from "./models/dapp";
import { Review } from "./models/review";

interface IDappDataSource {
  getFeaturedList(builder: EndpointBuilder<any, any, any>);

  getAppList(builder: EndpointBuilder<any, any, any>);

  getInfiniteAppList(builder: EndpointBuilder<any, any, any>);

  getDappReviews(builder: EndpointBuilder<any, any, any>);

  getCategoryList(builder: EndpointBuilder<any, any, any>);

  getAppsInCategoryList(builder: EndpointBuilder<any, any, any>);
}

export class DappDataSource implements IDappDataSource {
  registerEndpoints(this, api) {
    return api.injectEndpoints({
      endpoints: (build) => ({
        getDappList: this.getAppList(build),
        getInfiniteDappList: this.getInfiniteAppList(build),
        getFeaturedList: this.getFeaturedList(build),
        getCategoryList: this.getCategoryList(build),
        getAppsInCategoryList: this.getAppsInCategoryList(build),
      }),
    });
  }

  getAppList(builder: EndpointBuilder<any, any, any>) {
    return builder.query<PagedResponse<Dapp>, PagedRequest>({
      query: (args) => ({
        url: `${ApiEndpoints.APP_LIST}`,
        params: args,
      }),
    });
  }

  // New RTK added for infinite list, this one merger the data itself
  getInfiniteAppList(builder: EndpointBuilder<any, any, any>) {
    return builder.query<any, any>({
      query: (args) => ({
        url: `${ApiEndpoints.APP_LIST}`,
        params: args,
      }),
      serializeQueryArgs: ({ queryArgs, endpointDefinition, endpointName }) => {
        if (queryArgs?.categories !== undefined) {
          return endpointName + queryArgs?.categoreis;
        } else if (queryArgs?.search !== undefined) {
          return endpointName + queryArgs?.search;
        } else return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        console.log("PreviousPage: ", previousArg?.page);
        console.log("CurrentPage: ", currentArg?.page);
        return currentArg !== previousArg;
      },
      keepUnusedDataFor: 360,
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems, otherArgs) => {
        console.log("newItems", newItems);
        if (currentCache.response === undefined) {
          currentCache.response = newItems.response;
        } else {
          currentCache.response?.push(...newItems.response);
        }
        currentCache.page = newItems.page;
        console.log("currentCache", currentCache);
      },
    });
  }

  getFeaturedList(builder: EndpointBuilder<any, any, any>) {
    return builder.query<PagedResponse<Dapp>, void>({
      query: () => ApiEndpoints.FEATURED,
    });
  }

  getDappReviews(builder: EndpointBuilder<any, any, any>) {
    return builder.query<PagedResponse<Review>, string>({
      query: (appId) => `${ApiEndpoints.REVIEWS}?dappId=${appId}`,
    });
  }

  getCategoryList(builder: EndpointBuilder<any, any, any>) {
    return builder.query<CategoryListResponse, string>({
      query: () => `${ApiEndpoints.APP_CATEGORIES_LIST}?chainId=137`,
    });
  }

  getAppsInCategoryList(builder: EndpointBuilder<any, any, any>) {
    return builder.query<PagedResponse<Dapp>, Array<string>>({
      query: (params) => ({
        url: `/api/v1/dapp/search`,
        params: params,
      }),
    });
  }
}

export const dAppDataSource = new DappDataSource();

export const {
  useGetDappListQuery,
  useGetInfiniteDappListQuery,
  useGetCategoryListQuery,
  useGetAppsInCategoryListQuery,
} = dAppDataSource.registerEndpoints(api);
