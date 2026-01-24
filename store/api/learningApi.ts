import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';


interface LearningFile {
    id: number;
    filename: string;
    originalName: string;
    path: string;
    url: string;
    mimeType: string;
    size: number;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    learningId: number;
    contentLearningId: number;
    createdAt: string;
    updatedAt: string;
}


interface ContentLearning {
    id: number;
    description: string;
    files: LearningFile[];
    learningId: number;
    createdAt: string;
    updatedAt: string;
}


interface Learning {
    id: number;
    title: string;
    content: ContentLearning[];
    createdAt: string;
    updatedAt: string;
}


interface CreateLearningDto {
    title: string;
}


interface UpdateLearningDto {
    title?: string;
}


interface CreateContentLearningDto {
    description: string;
}

interface UpdateContentLearningDto {
    description?: string;
    removeFileIds?: number[];
}

export const learningApi = createApi({
    reducerPath: 'learningApi',
    baseQuery: baseQuery,
    tagTypes: ['Learning', 'LearningContent'],
    endpoints: (builder) => ({
        
        // Получение всех уроков
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

        // Получение урока по ID
        getLearningById: builder.query<Learning, number>({
            query: (id) => `learning/${id}`,
            providesTags: (result, error, id) => [{ type: 'Learning', id }],
        }),

        // Создание урока (только название)
        addLearning: builder.mutation<Learning, CreateLearningDto>({
            query: (dto) => ({
                url: 'learning',
                method: 'POST',
                body: dto,
            }),
            invalidatesTags: [{ type: 'Learning', id: 'LIST' }],
        }),

        // Обновление урока
        updateLearning: builder.mutation<Learning, { id: number; dto: UpdateLearningDto }>({
            query: ({ id, dto }) => ({
                url: `learning/${id}`,
                method: 'PATCH',
                body: dto,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Learning', id },
                { type: 'Learning', id: 'LIST' },
            ],
        }),

        // Удаление урока
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

        // Создание контента с файлами
        createContent: builder.mutation<ContentLearning, { 
            learningId: number; 
            formData: FormData 
        }>({
            query: ({ learningId, formData }) => {
                const id = Number(learningId);
                console.log('📝 createContent - learningId:', id, 'body:', formData);
                
                return {
                    url: `learning/${id}/content`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { learningId }) => [
                { type: 'Learning', id: learningId },
                { type: 'LearningContent', id: learningId },
            ],
        }),

        // Обновление контента с файлами
        updateContent: builder.mutation<ContentLearning, { 
            learningId: number; 
            contentId: number; 
            formData: FormData 
        }>({
            query: ({ learningId, contentId, formData }) => {
                console.log('🔧 === updateContent query ===');
                console.log('learningId input:', learningId, 'contentId input:', contentId);
                
                
                const url = `learning/${learningId}/content/${contentId}`;
                console.log('URL:', url);
                console.log('FormData:', formData);
                
                return {
                    url: url,
                    method: 'PATCH',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { learningId, contentId }) => [
                { type: 'Learning', id: learningId },
                { type: 'LearningContent', id: contentId },
            ],
        }),

        // Удаление контента
        deleteContent: builder.mutation<void, { learningId: number; contentId: number }>({
            query: ({ learningId, contentId }) => ({
                url: `learning/${learningId}/content/${contentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { learningId, contentId }) => [
                { type: 'Learning', id: learningId },
                { type: 'LearningContent', id: contentId },
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
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
} = learningApi;

export type {
    Learning,
    ContentLearning,
    LearningFile,
    CreateLearningDto,
    UpdateLearningDto,
    CreateContentLearningDto,
    UpdateContentLearningDto,
};
