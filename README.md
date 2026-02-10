
# Property & Rental Management System (PRMS)

A structured web application designed to replace WhatsApp-based reporting for property management teams.

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend (Reference):** Python Flask, MySQL, SQLAlchemy
- **Analytics:** Recharts (Data Visualization)
- **Deployment:** Production-ready configuration provided.

## Features
- **Role-Based Access:** Admin and Employee roles with specific permissions.
- **Activity Logging:** Every action (Create, Update, Status Change) is logged.
- **Financial Tracking:** Validated forms for payments and expenses.
- **Dynamic Analytics:** Monthly income/expense tracking and profit trends.
- **Expected Calculations:** Formula-based projection for next month's balance.

## GitHub Setup Steps
1. `git init`
2. `git add .`
3. `git commit -m "Initial commit: Core PRMS implementation with Auth and Logs"`
4. `git remote add origin <your-repo-url>`
5. `git push -u origin main`

## Deployment Instructions (Production)
1. **Database:** Execute `backend_reference/schema.sql` on a MySQL server.
2. **Backend:**
   - Install requirements: `pip install flask flask-sqlalchemy mysql-connector-python`
   - Configure Environment Variables: `DB_URL=mysql+mysqlconnector://user:pass@host/prms_db`
   - Run: `python backend_reference/app.py`
3. **Frontend:**
   - Run `npm install` and `npm run build`.
   - Serve the build folder using Nginx or an Apache server.

## Activity Rules
- **Properties:** Cannot be deleted if units exist.
- **Tenants:** History is never deleted; status moves from 'active' to 'left'.
- **Payments:** Mandatory validation; Admin correction toggle included.
