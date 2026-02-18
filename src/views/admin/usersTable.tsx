import React from 'react';
import { User, UserList } from '../../service/pizzaService';
import { TrashIcon } from '../../icons';
import { pizzaService } from '../../service/service';

interface Props {
	users: User[];
}

export default function UsersTable() {
	const [page, setPage] = React.useState(0);
	const [usersList, setUsersList] = React.useState<UserList>({
		users: [], more: false
	});
	const filterUsersRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		(async () => {
			const res = await pizzaService.getUsers(page, 3, '*')
			setUsersList(res);
		})();
	}, [page]);

	function deleteUser(user: User) {

	}

	function filterUsers() {

	}

	return (
		<div className="bg-neutral-100 overflow-clip my-4">
			<div className="flex flex-col">
				<div className="-m-1.5 overflow-x-auto">
					<div className="p-1.5 min-w-full inline-block align-middle">
						<div className="overflow-hidden">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
									<tr>
										{['ID', 'Name', 'Email', 'Roles', 'Action'].map((header) => (
											<th key={header} scope="col" className="px-6 py-3 text-center text-xs font-medium">
												{header}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{usersList.users.map((user, index) => {
										return (
											<tr key={user.id} className="border-neutral-500 border-t-2">
												<td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">{user.id}</td>
												<td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800">{user.name}</td>
												<td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800">{user.email}</td>
												<td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800">{user.roles?.map(role => role.role)?.join(', ') ?? ''}</td>
												<td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
													<button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400  hover:border-orange-800 hover:text-orange-800" onClick={() => deleteUser(user)}>
														<TrashIcon />
														Delete
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
								<tfoot>
									<tr>
										<td className="px-1 py-1">
											<input type="text" ref={filterUsersRef} name="filterUser" placeholder="Filter users" className="px-2 py-1 text-sm border border-gray-300 rounded-lg" />
											<button type="submit" className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={filterUsers}>
												Submit
											</button>
										</td>
										<td colSpan={4} className="text-end text-sm font-medium">
											<button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300 " onClick={() => setPage(page - 1)} disabled={page <= 0}>
												«
											</button>
											<button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300" onClick={() => setPage(page + 1)} disabled={!usersList.more}>
												»
											</button>
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}