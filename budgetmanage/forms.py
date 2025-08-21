from django import forms
from .models import Expense, RecurringExpense

class AddExpenseForm(forms.ModelForm):
    category_name = forms.CharField(widget=forms.HiddenInput())

    class Meta:
        model = Expense
        fields = ['amount', 'date', 'description']
        widgets = {
            'amount': forms.NumberInput(attrs={'placeholder': '0.00', 'step': '0.01'}),
            'date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3, 'placeholder': 'What did you spend on?'}),
        }

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.user = self.user
        instance.category = self.cleaned_data['category_name']
        if commit:
            instance.save()
        return instance

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)


class RecurringExpenseForm(forms.ModelForm):
    category_name = forms.CharField(widget=forms.HiddenInput())
    frequency = forms.ChoiceField(
        choices=RecurringExpense.Frequency.choices,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = RecurringExpense
        fields = ['amount', 'date', 'description', 'frequency', 'start_date', 'end_date']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.user = self.user
        instance.category = self.cleaned_data['category_name']
        if commit:
            instance.save()
        return instance

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)