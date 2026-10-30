import type { CategoryConfig } from '../legacy/types/game';

export default function CategorySelector({ categories, selected, onChange }: {
  categories: CategoryConfig[]; selected: string[]; onChange: (ids: string[]) => void;
}) {
  return <fieldset className="choices category-choices"><legend>Categories</legend>{categories.map(category =>
    <label className="choice" key={category.id}>
      <input type="checkbox" checked={selected.includes(category.id)} onChange={event =>
        onChange(event.target.checked ? [...selected, category.id] : selected.filter(id => id !== category.id))} />
      <span>{category.label}</span>
    </label>,
  )}</fieldset>;
}
