import { useState, type ReactNode } from "react";
import { HelpCircle, X, Copy, Check, Database } from "lucide-react";

const MSSQL_COMMAND = `SELECT 
    KCU1.TABLE_NAME AS 'Child_Table', 
    KCU1.COLUMN_NAME AS 'Child_Column', 
    KCU2.TABLE_NAME AS 'Parent_Table', 
    KCU2.COLUMN_NAME AS 'Parent_Column',
    RC.CONSTRAINT_NAME AS 'Relationship_Name'
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS RC
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU1 
    ON RC.CONSTRAINT_NAME = KCU1.CONSTRAINT_NAME
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU2 
    ON RC.UNIQUE_CONSTRAINT_NAME = KCU2.CONSTRAINT_NAME
    AND KCU1.ORDINAL_POSITION = KCU2.ORDINAL_POSITION
ORDER BY Child_Table;`;

const SQLITE_COMMAND = `sqlite3 -header -csv your_database.db "SELECT m.name AS Child_Table, p.\\"from\\" AS Child_Column, p.\\"table\\" AS Parent_Table, p.\\"to\\" AS Parent_Column, 'fk_' || m.name || '_' || p.\\"id\\" AS Relationship_Name FROM sqlite_schema AS m JOIN pragma_foreign_key_list(m.name) AS p WHERE m.type = 'table' ORDER BY Child_Table;" > relationships.csv`;

export function SQLHelpDialog({ children }: { children?: ReactNode }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"mssql" | "sqlite">("mssql");

  const handleCopy = async () => {
    const commandToCopy =
      activeTab === "mssql" ? MSSQL_COMMAND : SQLITE_COMMAND;
    await navigator.clipboard.writeText(commandToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {children ? (
        <div
          onClick={() => setIsHelpOpen(true)}
          className="inline-flex cursor-pointer"
          title="How to extract relationships?"
        >
          {children}
        </div>
      ) : (
        <button
          onClick={() => setIsHelpOpen(true)}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground border border-border rounded-lg text-[15px] font-medium cursor-pointer hover:bg-border/50 transition-colors"
          title="How to extract relationships?"
        >
          <HelpCircle size={18} />
          <span>How to extract Schema?</span>
        </button>
      )}

      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-panel border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col pt-0 pb-0 mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HelpCircle size={20} className="text-primary" />
                How To Extract the Schema?
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 hover:bg-border/50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab("mssql")}
                  className={`px-4 py-2 font-medium text-sm transition-all rounded-md flex items-center gap-2 ${activeTab === "mssql" ? "bg- text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Database
                    size={16}
                    className={activeTab === "mssql" ? "text-primary" : ""}
                  />
                  MS SQL
                </button>
                <button
                  onClick={() => setActiveTab("sqlite")}
                  className={`px-4 py-2 font-medium text-sm transition-all rounded-md flex items-center gap-2 ${activeTab === "sqlite" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Database
                    size={16}
                    className={activeTab === "sqlite" ? "text-primary" : ""}
                  />
                  SQLite
                </button>
              </div>

              {activeTab === "mssql" ? (
                <p className="text-sm text-start text-muted-foreground mb-4">
                  Run this query in Microsoft SQL Server Management Studio. Save
                  the results as a CSV file and upload it here.
                </p>
              ) : (
                <p className="text-sm text-start text-muted-foreground mb-4">
                  Run this command in your terminal. It will extract the
                  relationships from your SQLite database and save them to a CSV
                  file.
                  <br />
                  <span className="font-semibold text-foreground">
                    Make sure to change{" "}
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      your_database.db
                    </code>{" "}
                    to your actual database file path.
                  </span>
                </p>
              )}

              <div className="relative group">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border text-foreground text-start">
                  <code>
                    {activeTab === "mssql" ? (
                      MSSQL_COMMAND
                    ) : (
                      <>
                        {SQLITE_COMMAND.split("your_database.db")[0]}
                        <span className="text-primary font-bold bg-primary/10 px-1 rounded">
                          your_database.db
                        </span>
                        {
                          SQLITE_COMMAND.split("your_database.db")[1].split(
                            "relationships.csv",
                          )[0]
                        }
                        <span className="text-red-900 font-bold bg-red-600/30 px-1 rounded">
                          relationships.csv
                        </span>
                        {SQLITE_COMMAND.split("relationships.csv")[1]}
                      </>
                    )}
                  </code>
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 bg-panel/80 hover:bg-panel border border-border rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 flex items-center gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
