import { createRoot, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import {
	SearchControl,
	Spinner,
	Button,
	TextControl,
	Modal,
} from '@wordpress/components';

const EditPageForm = ( { pageId, onCancel, onSaveFinished } ) => {
	const { lastError, page, isSaving, hasEdits } = useSelect(
		( select ) => ( {
			page: select( coreDataStore ).getEditedEntityRecord(
				'postType',
				'page',
				pageId
			),
			lastError: select( coreDataStore ).getLastEntitySaveError(
				'postType',
				'page',
				pageId
			),
			isSaving: select( coreDataStore ).isSavingEntityRecord(
				'postType',
				'page',
				pageId
			),
			hasEdits: select( coreDataStore ).hasEditsForEntityRecord(
				'postType',
				'page',
				pageId
			),
		} ),
		[ pageId ]
	);
	const { editEntityRecord } = useDispatch( coreDataStore );
	const handleChange = ( title ) =>
		editEntityRecord( 'postType', 'page', pageId, { title } );
	const { saveEditedEntityRecord } = useDispatch( coreDataStore );
	const handleSave = async () => {
		const updatedRecord = await saveEditedEntityRecord(
			'postType',
			'page',
			pageId
		);
		if ( updatedRecord ) {
			onSaveFinished();
		}
	};
	return (
		<PageForm
			title={ page.title }
			onChangeTitle={ handleChange }
			hasEdits={ hasEdits }
			lastError={ lastError }
			isSaving={ isSaving }
			onCancel={ onCancel }
			onSave={ handleSave }
		/>
	);
};

const PageEditButton = ( { pageId } ) => {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	return (
		<>
			<Button onClick={ openModal } variant="primary">
				Edit
			</Button>
			{ isOpen && (
				<Modal title="Edit Page" onRequestClose={ closeModal }>
					<EditPageForm
						pageId={ pageId }
						onCancel={ closeModal }
						onSaveFinished={ closeModal }
					/>
				</Modal>
			) }
		</>
	);
};

const PagesList = ( { hasResolved, pages } ) => {
	if ( ! hasResolved ) {
		return <Spinner />;
	}
	if ( ! pages?.length ) {
		return <div>No results.</div>;
	}
	return (
		<table className="wp-list-table widefat fixed striped table-view-list">
			<thead>
				<tr>
					<th>Title</th>
					<th style={ { width: 120 } }>Actions</th>
				</tr>
			</thead>
			<tbody>
				{ pages?.map( ( page ) => (
					<tr key={ page.id }>
						<td>{ decodeEntities( page.title.rendered ) }</td>
						<td>
							<PageEditButton pageId={ page.id } />
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
};

const MyFirstApp = () => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const { pages, hasResolved } = useSelect(
		( select ) => {
			const query = {};
			if ( searchTerm ) {
				query.search = searchTerm;
			}
			return {
				pages: select( coreDataStore ).getEntityRecords(
					'postType',
					'page',
					query
				),
				hasResolved: select( coreDataStore ).hasFinishedResolution(
					'getEntityRecords',
					[ 'postType', 'page', query ]
				),
			};
		},
		[ searchTerm ]
	);
	return (
		<div>
			<div className="list-controls">
				<SearchControl
					value={ searchTerm }
					onChange={ setSearchTerm }
				/>
				<CreatePageButton />
			</div>
			<PagesList hasResolved={ hasResolved } pages={ pages } />
		</div>
	);
};

const CreatePageButton = () => {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	return (
		<>
			<Button onClick={ openModal } variant="primary">
				Create Page
			</Button>
			{ isOpen && (
				<Modal title="Create Page" onRequestClose={ closeModal }>
					<CreatePageForm
						onCancel={ closeModal }
						onSaveFinished={ closeModal }
					/>
				</Modal>
			) }
		</>
	);
};

const PageForm = ( {
	title,
	onChangeTitle,
	hasEdits,
	lastError,
	isSaving,
	onCancel,
	onSave,
} ) => {
	return (
		<div className="my-gutenberg-form">
			<TextControl
				value={ title }
				label="Page title"
				onChange={ onChangeTitle }
			/>
			{ lastError ? (
				<div className="form-error">Error: { lastError.message }</div>
			) : (
				false
			) }
			<div className="form-buttons">
				<Button
					onClick={ onSave }
					variant="primary"
					disabled={ ! hasEdits || isSaving }
				>
					{ isSaving ? (
						<>
							<Spinner /> Saving
						</>
					) : (
						'Save'
					) }
				</Button>
				<Button
					onClick={ onCancel }
					variant="tertiary"
					disabled={ isSaving }
				>
					Cancel
				</Button>
			</div>
		</div>
	);
};

const CreatePageForm = ( { onCancel, onSaveFinished } ) => {
	const [ title, setTitle ] = useState( '' );
	const handleChange = ( title ) => setTitle( title );
	return (
		<PageForm
			title={ title }
			onChangeTitle={ setTitle }
			hasEdits={ !! title }
			onChange={ handleChange }
		/>
	);
};

window.addEventListener(
	'load',
	function () {
		const container = document.getElementById( 'my-first-gutenberg-app' );
		const root = createRoot( container );
		root.render( <MyFirstApp /> );
	},
	false
);