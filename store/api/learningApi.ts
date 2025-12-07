import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';

// Типы для файлов
interface LearningFile {
    id: number;
    url: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

// Типы для контента урока
interface LearningContent {
    id: number;
    description: string;
    files: LearningFile[];

}

// Тип для урока
interface Learning {
    id: number;
    title: string;
    content: LearningContent[];
    createdAt: string;
    updatedAt: string;
}

// Типы для создания контента
interface CreateContentRequest {
    description: string;
    files: number[]; // ID файлов
}

// Типы для создания урока
interface CreateLearningRequest {
    title: string;
    content: CreateContentRequest[];
}

// Типы для обновления контента
interface UpdateContentRequest {
    id?: number;
    description?: string;
    keepFileIds?: number[];
    removeFileIds?: number[];
}

// Типы для обновления урока
interface UpdateLearningRequest {
    id: number;
    title?: string;
    content?: UpdateContentRequest[];
    removeFileIds?: number[];
    removeContentIds?: number[];
}

export const learningApi = createApi({
    reducerPath: 'learningApi',
    baseQuery: baseQuery,
    tagTypes: ['Learning'],
    endpoints: (builder) => ({
        
        getLearnings: builder.query<Learning[], void>({
            query: () => 'learning',
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Learning' as const, id })),
                        { type: 'Learning', id: 'LIST' },
                    ]
                    : [{ type: 'Learning', id: 'LIST' }],
        }),

        
        getLearningById: builder.query<Learning, number>({
            query: (id) => `learning/${id}`,
            providesTags: (result, error, id) => [{ type: 'Learning', id }],
        }),

      
        addLearning: builder.mutation<Learning, FormData>({
            query: (formData) => ({
                url: 'learning',
                method: 'POST',
                body: formData,
                formData: true,
            }),
            invalidatesTags: [{ type: 'Learning', id: 'LIST' }],
        }),

      
        updateLearning: builder.mutation<Learning, { id: number; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `learning/${id}`,
                method: 'PATCH',
                body: formData,
                formData: true,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Learning', id },
                { type: 'Learning', id: 'LIST' },
            ],
        }),

      
        deleteLearning: builder.mutation<void, number>({
            query: (id) => ({
                url: `learning/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Learning', id },
                { type: 'Learning', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetLearningsQuery,
    useGetLearningByIdQuery,
    useAddLearningMutation,
    useUpdateLearningMutation,
    useDeleteLearningMutation,
} = learningApi;


export type {
    Learning,
    LearningContent,
    LearningFile,
    CreateLearningRequest,
    CreateContentRequest,
    UpdateLearningRequest,
    UpdateContentRequest,
};
