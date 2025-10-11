import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Crown,
  Shield,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Video,
  Target,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import AdminLayout from "@/components/AdminLayout";

interface UserWithStats extends User {
  lastLogin?: string;
  totalStudyTime?: number;
  completedTests?: number;
  subscriptionStatus?: 'active' | 'inactive' | 'canceled';
  subscriptionType?: 'free' | 'premium';
  overallProgress?: number;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithStats | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithStats | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const users = usersResponse?.users || [];

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowUserDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { firstName: string; username: string; email: string; password: string; role: string; subscriptionType: string }) => {
      return apiRequest("POST", "/api/admin/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (user: UserWithStats) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const handleEditUser = (user: UserWithStats) => {
    setUserToEdit(user);
    setShowEditDialog(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && user.subscriptionStatus === "active") ||
                         (selectedStatus === "inactive" && user.subscriptionStatus === "inactive") ||
                         (selectedStatus === "premium" && user.subscriptionType === "premium");
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "canceled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "superadmin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case "premium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, permissions, and subscriptions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.subscriptionStatus === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.subscriptionType === 'premium').length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Roles</SelectItem>
                <SelectItem value="user" className="text-gray-900 dark:text-white">Users</SelectItem>
                <SelectItem value="admin" className="text-gray-900 dark:text-white">Admins</SelectItem>
                <SelectItem value="superadmin" className="text-gray-900 dark:text-white">Super Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Status</SelectItem>
                <SelectItem value="active" className="text-gray-900 dark:text-white">Active</SelectItem>
                <SelectItem value="inactive" className="text-gray-900 dark:text-white">Inactive</SelectItem>
                <SelectItem value="premium" className="text-gray-900 dark:text-white">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filters" 
                  : "No users have been registered yet"}
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">User</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Role</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Subscription</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Progress</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Last Active</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" alt={user.firstName || user.username} />
                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                              {user.firstName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.firstName || user.username}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getRoleColor(user.role || 'user')}>
                          {user.role === 'superadmin' ? 'Super Admin' : 
                           user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(user.subscriptionStatus || 'inactive')}>
                          {user.subscriptionStatus === 'active' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getSubscriptionColor(user.subscriptionType || 'free')}>
                          {user.subscriptionType === 'premium' ? (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </>
                          ) : (
                            'Free'
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.overallProgress || 0} className="w-16 h-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.overallProgress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={selectedUser.firstName || selectedUser.username} />
                  <AvatarFallback>
                    {selectedUser.firstName?.charAt(0)?.toUpperCase() || selectedUser.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.firstName || selectedUser.username}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role || 'user')}>
                      {selectedUser.role === 'superadmin' ? 'Super Admin' : 
                       selectedUser.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.subscriptionStatus || 'inactive')}>
                      {selectedUser.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedUser.subscriptionType === 'premium' ? 'Premium' : 'Free'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.overallProgress || 0}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Statistics</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-lg font-semibold">{formatStudyTime(selectedUser.totalStudyTime || 0)}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Study Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-lg font-semibold">{selectedUser.completedTests || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Tests Completed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-lg font-semibold">{selectedUser.overallProgress || 0}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Overall Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </Button>
            <Button 
              onClick={() => handleEditUser(selectedUser!)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{userToDelete?.firstName || userToDelete?.username}"? This action cannot be undone.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              This will permanently remove the user and all their data.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserForm 
            onSubmit={(userData) => createUserMutation.mutate(userData)}
            isLoading={createUserMutation.isPending}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit User</DialogTitle>
          </DialogHeader>
          {userToEdit && (
            <EditUserForm 
              user={userToEdit}
              onSubmit={(userData) => updateUserMutation.mutate({ userId: userToEdit.id, data: userData })}
              isLoading={updateUserMutation.isPending}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

// Create User Form Component
function CreateUserForm({ onSubmit, isLoading, onCancel }: {
  onSubmit: (data: { firstName: string; username: string; email: string; password: string; role: string; subscriptionType: string }) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    username: '',
    email: '',
    password: '',
    role: 'student',
    subscriptionType: 'free'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
        <Input
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          placeholder="Enter first name"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Enter username"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter password"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription</label>
        <Select value={formData.subscriptionType} onValueChange={(value) => setFormData({ ...formData, subscriptionType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Edit User Form Component
function EditUserForm({ user, onSubmit, isLoading, onCancel }: {
  user: UserWithStats;
  onSubmit: (data: Partial<User>) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'student',
    subscriptionType: user.subscriptionType || 'free',
    subscriptionStatus: user.subscriptionStatus || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
        <Input
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          placeholder="Enter first name"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Enter username"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription</label>
        <Select value={formData.subscriptionType} onValueChange={(value) => setFormData({ ...formData, subscriptionType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <Select value={formData.subscriptionStatus} onValueChange={(value) => setFormData({ ...formData, subscriptionStatus: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isLoading ? "Updating..." : "Update User"}
        </Button>
      </DialogFooter>
    </form>
  );
}