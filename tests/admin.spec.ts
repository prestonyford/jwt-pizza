import { expect, test } from "playwright-test-coverage";
import { Page } from "playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
	let loggedInUser: User | undefined;
	const validUsers: Record<string, User> = {
		"a@jwt.com": {
			id: "1",
			name: "admin user",
			email: "a@jwt.com",
			password: "admin",
			roles: [{ role: Role.Diner }, {
				objectId: "1",
				role: Role.Franchisee,
			}, { role: Role.Admin }],
		},
	};

	await page.route("*/**/api/auth", async (route) => {
		if (route.request().method() === "PUT") {
			const loginReq = route.request().postDataJSON();
			const user = validUsers[loginReq.email];
			if (!user || user.password !== loginReq.password) {
				await route.fulfill({
					status: 401,
					json: { error: "Unauthorized" },
				});
				return;
			}
			loggedInUser = validUsers[loginReq.email];
			const loginRes = {
				user: loggedInUser,
				token: "abcdef",
			};
			await route.fulfill({ json: loginRes });
		}
	});

	await page.route("*/**/api/franchise/*", async (route) => {
		if (route.request().method() === "GET") {
			const res = [
				{
					id: "1",
					name: "franchise 1",
					admins: !loggedInUser ? [] : [
						validUsers[loggedInUser.email ?? ""],
					],
					stores: [
						{
							id: "1",
							name: "store 1",
							totalRevenue: 0.6084,
						},
					],
				},
			];
			await route.fulfill({ json: res });
		}
	});

	await page.route("*/**/api/franchise?page=0&limit=3&name=*", async (route) => {
		if (route.request().method() === "GET") {
			const res = {
				"franchises": [
					{
						"id": 149,
						"name": "0edfkqzkk8",
						"stores": [],
					},
					{
						"id": 121,
						"name": "0hivpvw1r7",
						"stores": [
							{
								"id": 29,
								"name": "gh406vbe71",
							},
						],
					},
					{
						"id": 9,
						"name": "0kj9mjyc5v",
						"stores": [],
					},
				],
				"more": true,
			};
			await route.fulfill({ json: res });
		}
	});

	await page.route("*/**/api/user/me", async (route) => {
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: loggedInUser });
	});

	await page.goto("/");
}

test("login admin view franchises", async ({ page }) => {
	await basicInit(page);

	await page.getByLabel("Global").getByRole("link", { name: "Franchise" })
		.click();
	await expect(page.getByRole("main")).toContainText(
		"So you want a piece of the pie?",
	);

	await expect(page.getByRole("alert")).toContainText(
		"If you are already a franchisee, pleaseloginusing your franchise account",
	);
	await page.getByRole("link", { name: "login", exact: true }).click();
	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(
		"a@jwt.com",
	);
	await page.getByRole("textbox", { name: "Email address" }).press("Tab");
	await page.getByRole("textbox", { name: "Password" }).fill("admin");
	await page.getByRole("button", { name: "Login" }).click();

	await page.getByRole("link", { name: "Admin" }).click();
	await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");

	await expect(page.getByRole("table")).toContainText("0edfkqzkk8");
	await expect(page.getByRole("table")).toContainText("Close");
	await expect(page.getByRole("button", { name: "Add Franchise" }))
		.toBeVisible();
});
