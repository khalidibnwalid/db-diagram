import { useState } from 'react';
import { HelpCircle, X, Copy, Check } from 'lucide-react';

const SQL_COMMAND = `SELECT 
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

export function SQLHelpDialog() {
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(SQL_COMMAND);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button
                onClick={() => setIsHelpOpen(true)}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground border border-border rounded-lg text-[15px] font-medium cursor-pointer hover:bg-border/50 transition-colors"
                title="How to extract relationships?"
            >
                <HelpCircle size={18} />
                <span>How to extract Schema?</span>
            </button>

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
                            <p className="text-sm text-start text-muted-foreground mb-4">
                                Run this query in Microsoft SQL Server Management Studio. Save the results as a CSV file and upload it here.
                                (you can also do the same for other databases, just format it preorply)
                            </p>
                            <div className="relative group">
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border text-foreground text-start">
                                    <code>{SQL_COMMAND}</code>
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
