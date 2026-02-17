import { expect, test } from "playwright-test-coverage";
import { Page } from "playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
	let loggedInUser: User | undefined;

	await page.route("*/**/api/auth", async (route) => {
		const method = route.request().method();
		if (method === "POST" || method === "PUT") {
			const req = route.request().postDataJSON();
			loggedInUser = Object.assign(loggedInUser ?? {}, {
				...req,
				id: 306,
				roles: [{ role: Role.Diner }],
			}) as User;
			const res = {
				"user": {
					"name": loggedInUser.name,
					"email": loggedInUser.email,
					"roles": loggedInUser.roles,
					"id": loggedInUser.id
				},
				"token": "abcdef",
			};
			await route.fulfill({ json: res });
		} else if (method === "DELETE") {
			route.fulfill({ json: { message: "logout successful" } });
		}
	});
	await page.route("*/**/api/order", async (route) => {
		const method = route.request().method();
		if (method === "GET") {
			if (!loggedInUser) {
				await route.fulfill({
					status: 401,
					json: { error: "Unauthorized" },
				});
				return;
			}
			const res = {
				"dinerId": loggedInUser.id,
				"orders": [],
				"page": 1,
			};
			await route.fulfill({ json: res });
		}
	});
	await page.route("*/**/api/user/*", async (route) => {
		const method = route.request().method();
		if (method === "PUT") {
			if (!loggedInUser) {
				await route.fulfill({
					status: 401,
					json: { error: "Unauthorized" },
				});
				return;
			}
			const req = route.request().postDataJSON();
			loggedInUser.name = req.name;
			loggedInUser.email = req.email;
			const res = { user: { ...req } };
			await route.fulfill({ json: res });
		}
	});
}

test("updateUser", async ({ page }) => {
	basicInit(page);

	const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
	await page.goto("/");
	await page.getByRole("link", { name: "Register" }).click();
	await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
	await page.getByRole("textbox", { name: "Email address" }).fill(email);
	await page.getByRole("textbox", { name: "Password" }).fill("diner");
	await page.getByRole("button", { name: "Register" }).click();

	await page.getByRole("link", { name: "pd" }).click();

	await expect(page.getByRole("main")).toContainText("pizza diner");

	//
	await page.getByRole("button", { name: "Edit" }).click();
	await expect(page.locator("h3")).toContainText("Edit user");
	await page.getByRole("button", { name: "Update" }).click();

	await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

	await expect(page.getByRole("main")).toContainText("pizza diner");

	//
	await page.getByRole("button", { name: "Edit" }).click();
	await expect(page.locator("h3")).toContainText("Edit user");
	await page.getByRole("textbox").first().fill("pizza dinerx");
	await page.getByRole("button", { name: "Update" }).click();

	await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

	await expect(page.getByRole("main")).toContainText("pizza dinerx");

	//
	await page.getByRole("link", { name: "Logout" }).click();
	await page.getByRole("link", { name: "Login" }).click();

	await page.getByRole("textbox", { name: "Email address" }).fill(email);
	await page.getByRole("textbox", { name: "Password" }).fill("diner");
	await page.getByRole("button", { name: "Login" }).click();

	await page.getByRole("link", { name: "pd" }).click();

	await expect(page.getByRole("main")).toContainText("pizza dinerx");
});
