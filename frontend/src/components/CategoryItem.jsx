import { Link } from "react-router-dom";

const CategoryItem = ({ category }) => {
	return (
		<Link to={`/category/${category.slug}`} className='group flex flex-col items-center gap-3 text-center'>
			<div className='aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-white'>
				<img
					src={category.imageUrl}
					alt={category.name}
					className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
					loading='lazy'
				/>
			</div>
			<span className='text-sm font-semibold text-gray-800 group-hover:text-brand-600'>{category.name}</span>
		</Link>
	);
};

export default CategoryItem;
