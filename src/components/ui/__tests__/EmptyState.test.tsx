import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title as Text component', () => {
    render(<EmptyState title="No Data Found" />);
    
    const title = screen.getByText('No Data Found');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('SPAN'); // Our mocked Text renders as span
  });

  it('should render title and description', () => {
    render(
      <EmptyState 
        title="No Data Found"
        description="There are no items to display"
      />
    );
    
    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('should apply h3 variant to title', () => {
    render(<EmptyState title="Empty State Title" />);
    
    const title = screen.getByText('Empty State Title');
    expect(title).toHaveStyle({
      fontSize: '20px', // TYPOGRAPHY.sizes.xl (h3 variant)
      fontWeight: '600', // TYPOGRAPHY.weights.semibold (h3 variant)
      textAlign: 'center'
    });
  });

  it('should apply body variant to description', () => {
    render(<EmptyState title="Title" description="Description text" />);
    
    const description = screen.getByText('Description text');
    expect(description).toHaveStyle({
      fontSize: '16px', // TYPOGRAPHY.sizes.base (body variant)
      textAlign: 'center',
      color: '#666666' // COLORS.textSecondary
    });
  });

  it('should render with icon', () => {
    const Icon = () => <span data-testid="empty-icon">📭</span>;
    render(
      <EmptyState 
        title="Empty Inbox"
        icon={<Icon />}
      />
    );
    
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('should apply proper spacing to icon container', () => {
    const Icon = () => <span data-testid="empty-icon">📭</span>;
    render(
      <EmptyState 
        title="Empty Inbox"
        icon={<Icon />}
      />
    );
    
    const iconElement = screen.getByTestId('empty-icon');
    const iconContainer = iconElement.parentElement;
    expect(iconContainer).toHaveStyle({
      marginBottom: '24px', // SPACING.lg
      alignItems: 'center',
      justifyContent: 'center'
    });
  });

  it('should render with action button using Button component', () => {
    const handleAction = jest.fn();
    render(
      <EmptyState 
        title="No Items"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON'); // Our mocked TouchableOpacity renders as button
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('should handle action button press', () => {
    const handleAction = jest.fn();
    render(
      <EmptyState 
        title="No Items"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when actionLabel or onAction is missing', () => {
    render(<EmptyState title="No Items" actionLabel="Add Item" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    
    render(<EmptyState title="No Items" onAction={jest.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply proper container styles', () => {
    render(<EmptyState title="Test Title" />);
    
    const title = screen.getByText('Test Title');
    const container = title.closest('div');
    expect(container).toHaveStyle({
      flex: '1',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px' // SPACING.xl
    });
  });

  it('should apply custom styles to container', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<EmptyState title="Custom Style" style={customStyle} />);
    
    const title = screen.getByText('Custom Style');
    const container = title.closest('div');
    expect(container).toHaveStyle({ backgroundColor: 'red' });
  });

  it('should apply proper title styling', () => {
    render(<EmptyState title="Styled Title" />);
    
    const title = screen.getByText('Styled Title');
    expect(title).toHaveStyle({
      color: '#333333', // COLORS.text
      marginBottom: '8px' // SPACING.sm
    });
  });

  it('should apply proper description styling', () => {
    render(<EmptyState title="Title" description="Description with styling" />);
    
    const description = screen.getByText('Description with styling');
    expect(description).toHaveStyle({
      color: '#666666', // COLORS.textSecondary
      textAlign: 'center',
      lineHeight: '24px',
      marginBottom: '24px' // SPACING.lg
    });
  });

  it('should apply proper action button styling', () => {
    const handleAction = jest.fn();
    render(
      <EmptyState 
        title="With Action"
        actionLabel="Click Me"
        onAction={handleAction}
      />
    );
    
    const buttonContainer = screen.getByRole('button').parentElement;
    expect(buttonContainer).toHaveStyle({
      marginTop: '16px', // SPACING.base
      minWidth: '200px'
    });
  });

  it('should render without description when not provided', () => {
    render(<EmptyState title="Title Only" />);
    
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  it('should handle all props together', () => {
    const handleAction = jest.fn();
    const Icon = () => <span data-testid="test-icon">🔍</span>;
    
    render(
      <EmptyState 
        title="Complete Example"
        description="This is a complete example with all props"
        icon={<Icon />}
        actionLabel="Take Action"
        onAction={handleAction}
        style={{ borderRadius: '10px' }}
      />
    );
    
    expect(screen.getByText('Complete Example')).toBeInTheDocument();
    expect(screen.getByText('This is a complete example with all props')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Take Action')).toBeInTheDocument();
    
    const container = screen.getByText('Complete Example').closest('div');
    expect(container).toHaveStyle({ borderRadius: '10px' });
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleAction).toHaveBeenCalled();
  });

  it('should maintain proper component hierarchy', () => {
    const Icon = () => <span data-testid="hierarchy-icon">📄</span>;
    render(
      <EmptyState 
        title="Hierarchy Test"
        description="Testing component structure"
        icon={<Icon />}
        actionLabel="Action"
        onAction={jest.fn()}
      />
    );
    
    const container = screen.getByText('Hierarchy Test').closest('div');
    const icon = screen.getByTestId('hierarchy-icon');
    const title = screen.getByText('Hierarchy Test');
    const description = screen.getByText('Testing component structure');
    const button = screen.getByRole('button');
    
    // All elements should be within the main container
    expect(container).toContainElement(icon.parentElement);
    expect(container).toContainElement(title);
    expect(container).toContainElement(description);
    expect(container).toContainElement(button.parentElement);
  });

  it('should render as View container', () => {
    render(<EmptyState title="View Container Test" />);
    
    const title = screen.getByText('View Container Test');
    const container = title.closest('div');
    expect(container?.tagName).toBe('DIV'); // Our mocked View renders as div
  });

  it('should handle empty title gracefully', () => {
    render(<EmptyState title="" />);
    
    // Component should still render but with empty title
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });
});