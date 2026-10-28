import { Link } from "react-router-dom";

const CategoryItem = ({ category }) => {
	return (
		<Link
			to={`/category/${category.slug}`}
			className='group relative block aspect-[3/4] overflow-hidden bg-gray-200'
		>
			<img
				src={category.imageUrl}
				alt={category.name}
				className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
				loading='lazy'
			/>
			<div className='absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent' />
			<span className='absolute bottom-3 left-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white'>
				{category.name}
			</span>
		</Link>
	);
};

export default CategoryItem;
