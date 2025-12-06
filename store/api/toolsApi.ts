import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';


interface Tool {
  id: string;
  name: string;
  tool_id: string;
  description?: string;
  size?: string;
  type?: string;
  files?: string[];
}

interface CreateToolRequest {
  name: string;
  tool_id: string;
  description?: string;
  size?: string;
  type?: string;
  files?: string[]; 
}

export const toolsApi = createApi({
  reducerPath: 'toolsApi',
  baseQuery: baseQuery,
  tagTypes: ['Tools'],
  endpoints: (builder) => ({
    getTools: builder.query<Tool[], void>({
      query: () => 'tools',
      providesTags: ['Tools'],
    }),
    getToolById: builder.query<Tool, string>({
      query: (id) => `tools/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tools', id }],
    }),
    addTool: builder.mutation<Tool, FormData>({
      query: (formData) => ({
        url: 'tools',
        method: 'POST',
        body: formData,
        formData: true, 
      }),
      invalidatesTags: ['Tools'],
    }),

    updateTool: builder.mutation<Tool, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `tools/${id}`,
        method: 'PATCH',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tools', id }],
    }),
    deleteTool: builder.mutation<void, string>({
      query: (id) => ({
        url: `tools/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tools'],
    }),
    deleteToolFile: builder.mutation<void, { toolId: string; fileId: string }>({
      query: ({ toolId, fileId }) => ({
        url: `tools/${toolId}/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { toolId }) => [{ type: 'Tools', id: toolId }],
    }),
  }),
});

export const {
  useGetToolsQuery,
  useGetToolByIdQuery,
  useAddToolMutation,
  useUpdateToolMutation,
  useDeleteToolMutation,
  useDeleteToolFileMutation,
} = toolsApi;
