"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { useCourses, useLearningDashboard, useCertificates } from "./hooks/useLearningData";
import { LearningHeader } from "./components/LearningHeader";
import { LearningStats } from "./components/LearningStats";
import { ContinueLearningCard } from "./components/ContinueLearningCard";
import { CourseCard } from "./components/CourseCard";
import { CertificateCard } from "./components/CertificateCard";
import { CategoryFilter } from "./components/CategoryFilter";
import { SearchBar } from "./components/SearchBar";
import { EmptyState, LoadingSkeleton } from "./components/EmptyState";
import { computeCourseProgress } from "./types";
import { Filter, X, ChevronDown } from "lucide-react"; // Import icons for the filter button

export default function LearningDashboardPage() {
  const { user } = useAuth();
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: dashboard, loading: dashboardLoading } = useLearningDashboard();
  const { data: certificates } = useCertificates();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");

  // State to toggle the unified filter popover visibility
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Count active filters to display a badge indicator
  const activeFiltersCount = [category, difficulty, status].filter(Boolean).length;

  const categories = useMemo(() => Array.from(new Set((courses ?? []).map((c) => c.category))), [courses]);

  const filteredCourses = useMemo(() => {
    return (courses ?? []).filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || c.category === category;
      const matchesDifficulty = !difficulty || c.difficulty === difficulty;
      const progress = computeCourseProgress(c);
      const statusLabel = progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started";
      const matchesStatus = !status || statusLabel === status;
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [courses, search, category, difficulty, status]);

  const continueCourse = dashboard?.currentCourseId ? (courses ?? []).find((c) => c.id === dashboard.currentCourseId) : null;
  const continueLesson = continueCourse?.modules.flatMap((m) => m.lessons).find((l) => l.id === dashboard?.currentLessonId);

  const loading = coursesLoading || dashboardLoading;

  return (
    <div className="space-y-6">
      {loading || !dashboard ? (
        <LoadingSkeleton rows={1} />
      ) : (
        <LearningHeader firstName={user?.intern?.fullName?.split(" ")[0] ?? "there"} streak={dashboard.streak} />
      )}

      {dashboard && (
        <LearningStats
          totalXp={dashboard.streak.totalXp}
          totalCertificates={dashboard.totalCertificates}
          completedLessonsCount={dashboard.recentlyCompletedLessons.length}
          overallProgressPercent={dashboard.overallProgressPercent}
        />
      )}

      {continueCourse && continueLesson && (
        <ContinueLearningCard
          courseId={continueCourse.id}
          lessonId={continueLesson.id}
          courseTitle={continueCourse.title}
          lessonTitle={continueLesson.title}
        />
      )}

      <div>
        {/* Search and Unified Filter Bar */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-4">
          
          {/* Search Bar Component */}
          <div className="flex-1 w-full">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Unified Filter Toggle Button */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Popover Panel containing Category, Difficulty, and Status */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-semibold text-slate-800 text-sm">Filter Courses</h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={category}
                    onCategoryChange={setCategory}
                    selectedDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    selectedStatus={status}
                    onStatusChange={setStatus}
                  />

                  {/* Optional Quick Action inside dropdown */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setCategory("");
                        setDifficulty("");
                        setStatus("");
                      }}
                      className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      Reset All
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {coursesLoading ? (
          <LoadingSkeleton rows={3} />
        ) : filteredCourses.length === 0 ? (
          <EmptyState title="No courses match your filters" subtitle="Try clearing search or filters" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {certificates && certificates.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">Your Certificates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}