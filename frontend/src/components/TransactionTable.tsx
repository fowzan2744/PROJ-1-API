import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Transaction {
  step: number;
  customer: string;
  age: number;
  gender: string;
  zipcodeOri: string;
  merchant: string;
  zipMerchant: string;
  category: string;
  amount: number;
  fraud: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, title = "Transactions" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fraudFilter, setFraudFilter] = useState('all');

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesFraud = fraudFilter === 'all' || 
      (fraudFilter === 'fraud' && transaction.fraud === 1) ||
      (fraudFilter === 'legitimate' && transaction.fraud === 0);

    return matchesSearch && matchesCategory && matchesFraud;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

  // Get unique categories
  const categories = [...new Set(transactions.map(t => t.category))];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers or merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fraudFilter} onValueChange={setFraudFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Fraud Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="legitimate">Legitimate</SelectItem>
              <SelectItem value="fraud">Fraud</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction, index) => (
                <TableRow key={`${transaction.step}-${index}`}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{transaction.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        Age: {transaction.age}, {transaction.gender}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{transaction.merchant}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.zipMerchant}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className={transaction.amount < 0 ? 'number-negative' : 'number-positive'}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.fraud === 1 ? "destructive" : "default"}
                      className={transaction.fraud === 1 ? "bg-error text-error-foreground" : "bg-success text-success-foreground"}
                    >
                      {transaction.fraud === 1 ? "Fraud" : "Legitimate"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.step}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;