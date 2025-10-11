import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Copy, 
  Archive, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Settings,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface Test {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  isActive: boolean;
  questions: any[];
}

interface BulkTestOperationsProps {
  selectedTests: string[];
  tests: Test[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkOperation: (operation: string, testIds: string[], options?: any) => Promise<void>;
  testType: 'practice' | 'mock';
}

const BulkTestOperations: React.FC<BulkTestOperationsProps> = ({
  selectedTests,
  tests,
  onSelectionChange,
  onBulkOperation,
  testType
}) => {
  const [showOperations, setShowOperations] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [operationOptions, setOperationOptions] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const operations = [
    {
      id: 'duplicate',
      label: 'Duplicate Tests',
      description: 'Create copies of selected tests',
      icon: Copy,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'archive',
      label: 'Archive Tests',
      description: 'Move tests to archive (inactive)',
      icon: Archive,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'activate',
      label: 'Activate Tests',
      description: 'Make tests available to students',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'deactivate',
      label: 'Deactivate Tests',
      description: 'Hide tests from students',
      icon: X,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'update_category',
      label: 'Update Category',
      description: 'Change category for selected tests',
      icon: Edit,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'update_difficulty',
      label: 'Update Difficulty',
      description: 'Change difficulty level',
      icon: Settings,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'export',
      label: 'Export Tests',
      description: 'Download test data',
      icon: Download,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'delete',
      label: 'Delete Tests',
      description: 'Permanently remove tests',
      icon: Trash2,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const categories = [
    'British History',
    'Government & Politics',
    'Geography & Culture',
    'Laws & Society'
  ];

  const difficulties = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Easy' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'Hard' },
    { value: 5, label: 'Expert' }
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange(tests.map(test => test.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleTestSelection = (testId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTests, testId]);
    } else {
      onSelectionChange(selectedTests.filter(id => id !== testId));
    }
  };

  const handleOperationSelect = (operationId: string) => {
    setSelectedOperation(operationId);
    setOperationOptions({});
    
    // Set default options based on operation
    switch (operationId) {
      case 'duplicate':
        setOperationOptions({ addSuffix: true, suffix: ' (Copy)' });
        break;
      case 'update_category':
        setOperationOptions({ category: 'British History' });
        break;
      case 'update_difficulty':
        setOperationOptions({ difficulty: 3 });
        break;
      case 'export':
        setOperationOptions({ format: 'json' });
        break;
      default:
        setOperationOptions({});
    }
  };

  const handleExecuteOperation = async () => {
    if (selectedTests.length === 0) {
      alert('Please select at least one test');
      return;
    }

    if (!selectedOperation) {
      alert('Please select an operation');
      return;
    }

    setLoading(true);
    try {
      await onBulkOperation(selectedOperation, selectedTests, operationOptions);
      setShowOperations(false);
      setSelectedOperation('');
      setOperationOptions({});
    } catch (error) {
      console.error('Bulk operation failed:', error);
      alert('Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    return operation ? operation.icon : Settings;
  };

  const getOperationColor = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    return operation ? operation.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Select All</Label>
              </div>
              <span className="text-sm text-gray-600">
                {selectedTests.length} of {tests.length} tests selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOperations(!showOperations)}
                disabled={selectedTests.length === 0}
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Operations
              </Button>
              <Button
                variant="outline"
                onClick={() => onSelectionChange([])}
                disabled={selectedTests.length === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test List with Selection */}
      <div className="space-y-2">
        {tests.map((test) => (
          <Card key={test.id} className="hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedTests.includes(test.id)}
                    onCheckedChange={(checked) => handleTestSelection(test.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{test.title}</h3>
                      <Badge variant={test.isActive ? 'default' : 'secondary'}>
                        {test.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Category: {test.category}</span>
                      <span>Difficulty: {test.difficulty}</span>
                      <span>Questions: {test.questions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Operations Panel */}
      {showOperations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Bulk Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operation Selection */}
            <div>
              <Label>Select Operation</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {operations.map((operation) => {
                  const IconComponent = operation.icon;
                  return (
                    <Button
                      key={operation.id}
                      variant={selectedOperation === operation.id ? 'default' : 'outline'}
                      onClick={() => handleOperationSelect(operation.id)}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs text-center">{operation.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Operation Options */}
            {selectedOperation && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {operations.find(op => op.id === selectedOperation)?.label}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {operations.find(op => op.id === selectedOperation)?.description}
                  </p>
                </div>

                {/* Duplicate Options */}
                {selectedOperation === 'duplicate' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="add-suffix"
                        checked={operationOptions.addSuffix}
                        onCheckedChange={(checked) => 
                          setOperationOptions({...operationOptions, addSuffix: checked})
                        }
                      />
                      <Label htmlFor="add-suffix">Add suffix to titles</Label>
                    </div>
                    {operationOptions.addSuffix && (
                      <div>
                        <Label htmlFor="suffix">Suffix</Label>
                        <Input
                          id="suffix"
                          value={operationOptions.suffix || ''}
                          onChange={(e) => 
                            setOperationOptions({...operationOptions, suffix: e.target.value})
                          }
                          placeholder="e.g., (Copy)"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Category Update Options */}
                {selectedOperation === 'update_category' && (
                  <div>
                    <Label htmlFor="new-category">New Category</Label>
                    <Select 
                      value={operationOptions.category || ''} 
                      onValueChange={(value) => 
                        setOperationOptions({...operationOptions, category: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Difficulty Update Options */}
                {selectedOperation === 'update_difficulty' && (
                  <div>
                    <Label htmlFor="new-difficulty">New Difficulty</Label>
                    <Select 
                      value={operationOptions.difficulty?.toString() || ''} 
                      onValueChange={(value) => 
                        setOperationOptions({...operationOptions, difficulty: parseInt(value)})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(difficulty => (
                          <SelectItem key={difficulty.value} value={difficulty.value.toString()}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Export Options */}
                {selectedOperation === 'export' && (
                  <div>
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select 
                      value={operationOptions.format || 'json'} 
                      onValueChange={(value) => 
                        setOperationOptions({...operationOptions, format: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Confirmation for Destructive Operations */}
                {(selectedOperation === 'delete' || selectedOperation === 'deactivate') && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This operation will {selectedOperation === 'delete' ? 'permanently delete' : 'deactivate'} {selectedTests.length} test(s). 
                      This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Execute Button */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowOperations(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleExecuteOperation}
                    disabled={loading}
                    className={getOperationColor(selectedOperation)}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      React.createElement(getOperationIcon(selectedOperation), { className: "w-4 h-4 mr-2" })
                    )}
                    Execute {operations.find(op => op.id === selectedOperation)?.label}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkTestOperations;
