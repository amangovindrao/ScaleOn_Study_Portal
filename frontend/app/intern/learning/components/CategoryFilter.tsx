import { Select } from "@/app/components/ui/input";

interface Props {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (v: string) => void;
  selectedStatus: string;
  onStatusChange: (v: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className="w-auto">
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </Select>
      <Select value={selectedDifficulty} onChange={(e) => onDifficultyChange(e.target.value)} className="w-auto">
        <option value="">All Difficulties</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </Select>
      <Select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} className="w-auto">
        <option value="">All Statuses</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </Select>
    </div>
  );
}
