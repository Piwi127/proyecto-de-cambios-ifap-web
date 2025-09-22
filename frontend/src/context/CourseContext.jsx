import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';

const CourseContext = createContext();

// Tipos de acciones
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_COURSES: 'SET_COURSES',
  SET_MY_COURSES: 'SET_MY_COURSES',
  SET_COURSE_DETAIL: 'SET_COURSE_DETAIL',
  SET_COURSE_LESSONS: 'SET_COURSE_LESSONS',
  UPDATE_COURSE_PROGRESS: 'UPDATE_COURSE_PROGRESS',
  ENROLL_IN_COURSE: 'ENROLL_IN_COURSE',
  UNENROLL_FROM_COURSE: 'UNENROLL_FROM_COURSE',
  MARK_LESSON_COMPLETED: 'MARK_LESSON_COMPLETED'
};

// Estado inicial
const initialState = {
  loading: false,
  error: null,
  courses: [],
  myCourses: [],
  courseDetails: {},
  courseLessons: {},
  enrolledCourses: new Set()
};

// Reducer
const courseReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case actionTypes.SET_COURSES:
      return { ...state, courses: action.payload, loading: false, error: null };

    case actionTypes.SET_MY_COURSES:
      return { 
        ...state, 
        myCourses: action.payload,
        enrolledCourses: new Set(action.payload.map(course => course.id)),
        loading: false, 
        error: null 
      };

    case actionTypes.SET_COURSE_DETAIL:
      return {
        ...state,
        courseDetails: {
          ...state.courseDetails,
          [action.payload.id]: action.payload
        }
      };

    case actionTypes.SET_COURSE_LESSONS:
      return {
        ...state,
        courseLessons: {
          ...state.courseLessons,
          [action.payload.courseId]: action.payload.lessons
        }
      };

    case actionTypes.UPDATE_COURSE_PROGRESS:
      return {
        ...state,
        myCourses: state.myCourses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, progress: action.payload.progress }
            : course
        )
      };

    case actionTypes.ENROLL_IN_COURSE:
      return {
        ...state,
        enrolledCourses: new Set([...state.enrolledCourses, action.payload]),
        myCourses: [...state.myCourses, state.courses.find(c => c.id === action.payload)]
      };

    case actionTypes.UNENROLL_FROM_COURSE: {
      const newEnrolled = new Set(state.enrolledCourses);
      newEnrolled.delete(action.payload);
      return {
        ...state,
        enrolledCourses: newEnrolled,
        myCourses: state.myCourses.filter(course => course.id !== action.payload)
      };
    }

    case actionTypes.MARK_LESSON_COMPLETED:
      return {
        ...state,
        courseLessons: {
          ...state.courseLessons,
          [action.payload.courseId]: state.courseLessons[action.payload.courseId]?.map(lesson =>
            lesson.id === action.payload.lessonId
              ? { ...lesson, completed: true }
              : lesson
          )
        }
      };

    default:
      return state;
  }
};

const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Acciones
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),

    fetchAllCourses: async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const courses = await courseService.getAllCourses();
        dispatch({ type: actionTypes.SET_COURSES, payload: courses });
        return courses;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    fetchMyCourses: async () => {
      try {
        if (!isAuthenticated) return [];
        
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const myCourses = await courseService.getMyCourses();
        dispatch({ type: actionTypes.SET_MY_COURSES, payload: myCourses });
        return myCourses;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    fetchCourseDetail: async (courseId) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const course = await courseService.getCourseById(courseId);
        dispatch({ type: actionTypes.SET_COURSE_DETAIL, payload: course });
        return course;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    fetchCourseLessons: async (courseId) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const lessons = await lessonService.getMyCourseLessons(courseId);
        dispatch({ 
          type: actionTypes.SET_COURSE_LESSONS, 
          payload: { courseId, lessons } 
        });
        return lessons;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    enrollInCourse: async (courseId) => {
      try {
        await courseService.enrollInCourse(courseId);
        dispatch({ type: actionTypes.ENROLL_IN_COURSE, payload: courseId });
        return true;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    unenrollFromCourse: async (courseId) => {
      try {
        await courseService.unenrollFromCourse(courseId);
        dispatch({ type: actionTypes.UNENROLL_FROM_COURSE, payload: courseId });
        return true;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    markLessonCompleted: async (courseId, lessonId) => {
      try {
        await lessonService.markLessonCompleted(lessonId);
        dispatch({ 
          type: actionTypes.MARK_LESSON_COMPLETED, 
          payload: { courseId, lessonId } 
        });
        return true;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    searchCourses: async (query, filters = {}) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const results = await courseService.searchCourses(query, filters);
        return results;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    }
  };

  // Efecto para cargar datos iniciales cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      actions.fetchAllCourses();
      actions.fetchMyCourses();
    }
  }, [isAuthenticated]);

  const value = {
    ...state,
    ...actions,
    isEnrolled: (courseId) => state.enrolledCourses.has(courseId),
    getCourseProgress: (courseId) => {
      const course = state.myCourses.find(c => c.id === courseId);
      return course?.progress || 0;
    },
    getCourseLessons: (courseId) => state.courseLessons[courseId] || [],
    getCourseDetail: (courseId) => state.courseDetails[courseId]
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseProvider;

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};